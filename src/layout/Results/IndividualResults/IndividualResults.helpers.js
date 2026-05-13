import { allParticipants } from '../../../datas/countries';
import {
    getCommunityRankingFromSnapshot,
    getCommunityRankingVoters,
} from '../CommunityResults/CommunityResults.helpers';
import { getResultsSessionConfig } from '../shared/resultsShared';
import {
    getOfficialResultType,
    getQualifiedParticipantCodesFromOfficialRankingCodes,
    OFFICIAL_RESULT_TYPES,
} from '../../../utils/helpers/officialResults';

export const INDIVIDUAL_RESULTS_VIEW_KEYS = {
    podium: 'podium',
    community: 'community',
    voter: 'voter',
};

export const INDIVIDUAL_RESULTS_VIEW_ITEMS = [
    {
        key: INDIVIDUAL_RESULTS_VIEW_KEYS.podium,
        label: 'Podium',
    },
    {
        key: INDIVIDUAL_RESULTS_VIEW_KEYS.community,
        label: 'Classement communautaire',
    },
];

const PODIUM_BONUS_POINTS = [20, 16, 14];
const QUALIFICATION_POINTS_BY_POSITION = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

function getParticipantsByCode() {
    return new Map(
        allParticipants.map((participant) => [participant.code, participant]),
    );
}

function getAllowedParticipantCodes(sessionKey) {
    return getResultsSessionConfig(sessionKey).participantCodes;
}

function getParticipantOrderMap(sessionKey) {
    return new Map(
        getAllowedParticipantCodes(sessionKey).map((participantCode, index) => [
            participantCode,
            index,
        ]),
    );
}

export function getIndividualParticipants(sessionKey) {
    const allowedParticipantCodes = getAllowedParticipantCodes(sessionKey);
    const participantsByCode = getParticipantsByCode();

    return allowedParticipantCodes
        .map((participantCode) => participantsByCode.get(participantCode))
        .filter(Boolean);
}

export function formatIndividualPointsLabel(points, { withPrefix = false } = {}) {
    const prefix = withPrefix ? '+ ' : '';
    return `${prefix}${points} pt${points > 1 ? 's' : ''}`;
}

export function getIndividualPointsLabelParts(
    points,
    { withPrefix = false } = {},
) {
    return {
        prefix: withPrefix ? '+' : '',
        value: String(points),
        suffix: `pt${points > 1 ? 's' : ''}`,
    };
}

export function getIndividualRankingFromCodes(sessionKey, rankingCodes) {
    if (!Array.isArray(rankingCodes) || rankingCodes.length === 0) {
        return getIndividualParticipants(sessionKey);
    }

    const allowedParticipantCodes = getAllowedParticipantCodes(sessionKey);
    const participantsByCode = getParticipantsByCode();
    const allowedCodes = new Set(allowedParticipantCodes);
    const seenCodes = new Set();

    const orderedParticipants = rankingCodes
        .filter((participantCode) => allowedCodes.has(participantCode))
        .map((participantCode) => {
            seenCodes.add(participantCode);
            return participantsByCode.get(participantCode);
        })
        .filter(Boolean);

    const missingParticipants = allowedParticipantCodes
        .filter((participantCode) => !seenCodes.has(participantCode))
        .map((participantCode) => participantsByCode.get(participantCode))
        .filter(Boolean);

    return [...orderedParticipants, ...missingParticipants];
}

export function getPlacementScore(positionDelta) {
    if (positionDelta === 0) {
        return 7;
    }

    if (positionDelta === 1) {
        return 4;
    }

    if (positionDelta === 2 || positionDelta === 3) {
        return 1;
    }

    return 0;
}

export function getQualificationScore(predictedPosition, isQualified) {
    if (!isQualified || predictedPosition < 1 || predictedPosition > 10) {
        return 0;
    }

    return QUALIFICATION_POINTS_BY_POSITION[predictedPosition - 1] ?? 0;
}

export function getPodiumBonus(predictedPosition, officialPosition) {
    if (predictedPosition !== officialPosition || officialPosition > 3) {
        return 0;
    }

    return PODIUM_BONUS_POINTS[officialPosition - 1] ?? 0;
}

export function buildIndividualRankingBreakdown(
    predictedRanking,
    officialRanking,
) {
    const officialPositionByCode = new Map(
        officialRanking.map((participant, index) => [participant.code, index + 1]),
    );

    return predictedRanking.map((participant, index) => {
        const predictedPosition = index + 1;
        const officialPosition =
            officialPositionByCode.get(participant.code) ?? null;
        const positionDelta =
            officialPosition == null
                ? Number.POSITIVE_INFINITY
                : Math.abs(predictedPosition - officialPosition);
        const placementPoints = getPlacementScore(positionDelta);
        const podiumBonus = officialPosition
            ? getPodiumBonus(predictedPosition, officialPosition)
            : 0;

        return {
            code: participant.code,
            participant,
            predictedPosition,
            officialPosition,
            positionDelta,
            placementPoints,
            podiumBonus,
            totalPoints: placementPoints + podiumBonus,
        };
    });
}

export function buildQualificationRankingBreakdown(
    predictedRanking,
    qualifiedParticipantCodes,
) {
    const qualifiedCodes = new Set(qualifiedParticipantCodes);

    return predictedRanking.map((participant, index) => {
        const predictedPosition = index + 1;
        const isQualified = qualifiedCodes.has(participant.code);
        const qualificationPoints = getQualificationScore(
            predictedPosition,
            isQualified,
        );

        return {
            code: participant.code,
            participant,
            predictedPosition,
            officialPosition: isQualified ? 1 : null,
            positionDelta: isQualified ? 0 : Number.POSITIVE_INFINITY,
            placementPoints: qualificationPoints,
            podiumBonus: 0,
            totalPoints: qualificationPoints,
            isQualified,
        };
    });
}

export function getIndividualTotalScore(rankingBreakdown) {
    return rankingBreakdown.reduce(
        (totalScore, entry) => totalScore + entry.totalPoints,
        0,
    );
}

export function buildIndividualLeaderboard({
    sessionKey,
    officialRanking,
    qualifiedParticipantCodes,
    communityRanking,
    voters,
}) {
    const officialResultType = getOfficialResultType(sessionKey);
    const leaderboard = [];

    if (communityRanking?.length > 0) {
        const rankingBreakdown =
            officialResultType === OFFICIAL_RESULT_TYPES.qualification
                ? buildQualificationRankingBreakdown(
                      communityRanking,
                      qualifiedParticipantCodes,
                  )
                : buildIndividualRankingBreakdown(
                      communityRanking,
                      officialRanking,
                  );

        leaderboard.push({
            id: 'community',
            type: INDIVIDUAL_RESULTS_VIEW_KEYS.community,
            label: 'Classement communautaire',
            displayName: 'Classement communautaire',
            avatarUrl: null,
            isCommunity: true,
            ranking: communityRanking,
            rankingBreakdown,
            totalScore: getIndividualTotalScore(rankingBreakdown),
        });
    }

    voters.forEach((voter) => {
        const rankingBreakdown =
            officialResultType === OFFICIAL_RESULT_TYPES.qualification
                ? buildQualificationRankingBreakdown(
                      voter.ranking,
                      qualifiedParticipantCodes,
                  )
                : buildIndividualRankingBreakdown(
                      voter.ranking,
                      officialRanking,
                  );

        leaderboard.push({
            id: voter.userId,
            type: INDIVIDUAL_RESULTS_VIEW_KEYS.voter,
            label: voter.displayName,
            displayName: voter.displayName,
            avatarUrl: voter.avatarUrl ?? null,
            isCommunity: false,
            ranking: voter.ranking,
            rankingBreakdown,
            totalScore: getIndividualTotalScore(rankingBreakdown),
        });
    });

    return leaderboard
        .sort((entryA, entryB) => {
            if (entryB.totalScore !== entryA.totalScore) {
                return entryB.totalScore - entryA.totalScore;
            }

            if (entryA.isCommunity !== entryB.isCommunity) {
                return entryA.isCommunity ? -1 : 1;
            }

            return entryA.displayName.localeCompare(entryB.displayName);
        })
        .map((entry, index) => ({
            ...entry,
            position: index + 1,
        }));
}

export function getIndividualCommunityRanking(
    sessionKey,
    communityRankingEntries,
) {
    if (!Array.isArray(communityRankingEntries) || communityRankingEntries.length === 0) {
        return [];
    }

    const allowedCodes = new Set(getAllowedParticipantCodes(sessionKey));
    const participantOrderMap = getParticipantOrderMap(sessionKey);

    return [...communityRankingEntries]
        .filter((entry) => allowedCodes.has(entry.code))
        .sort((entryA, entryB) => {
            if ((entryA.position ?? 0) !== (entryB.position ?? 0)) {
                return (entryA.position ?? 0) - (entryB.position ?? 0);
            }

            return (
                (participantOrderMap.get(entryA.code) ?? Number.MAX_SAFE_INTEGER) -
                (participantOrderMap.get(entryB.code) ?? Number.MAX_SAFE_INTEGER)
            );
        })
        .map((entry) => entry.participant)
        .filter(Boolean);
}

export function getIndividualVoters(sessionKey, userRankings) {
    const participantCodes = getAllowedParticipantCodes(sessionKey);

    return getCommunityRankingVoters(userRankings, participantCodes);
}

export function getIndividualResultsState({
    officialRankingState,
    communityResult,
    sessionKey,
    userRankings,
}) {
    const participants = getIndividualParticipants(sessionKey);
    const officialResultType = getOfficialResultType(sessionKey);
    const isOfficialRankingPublished = Boolean(officialRankingState?.isPublished);
    const officialRanking = isOfficialRankingPublished
        ? getIndividualRankingFromCodes(
              sessionKey,
              officialRankingState?.rankingCodes,
          )
        : participants;
    const voters = getIndividualVoters(sessionKey, userRankings);
    const communityRankingEntries = communityResult?.rankingSnapshot
        ? getCommunityRankingFromSnapshot(
              communityResult.rankingSnapshot,
              getAllowedParticipantCodes(sessionKey),
          )
        : [];
    const communityRanking = communityRankingEntries.length
        ? getIndividualCommunityRanking(sessionKey, communityRankingEntries)
        : [];
    const qualifiedParticipantCodes =
        officialResultType === OFFICIAL_RESULT_TYPES.qualification
            ? getQualifiedParticipantCodesFromOfficialRankingCodes(
                  officialRankingState?.rankingCodes,
              )
            : [];
    const isCommunityRankingPublished =
        communityResult?.status === 'published' && communityRanking.length > 0;
    const leaderboard = isOfficialRankingPublished
        ? buildIndividualLeaderboard({
              sessionKey,
              officialRanking,
              qualifiedParticipantCodes,
              communityRanking: isCommunityRankingPublished
                  ? communityRanking
                  : [],
              voters,
          })
        : [];

    return {
        participants,
        officialRanking,
        voters,
        leaderboard,
        communityRanking,
        qualifiedParticipantCodes,
        officialResultType,
        isOfficialRankingPublished,
        isCommunityRankingPublished,
    };
}
