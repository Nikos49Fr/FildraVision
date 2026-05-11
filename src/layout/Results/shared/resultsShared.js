import {
    finalParticipants,
    semiFinal1Participants,
    semiFinal2Participants,
} from '../../../datas/countries';
import { USER_RANKING_SESSIONS } from '../../../utils/helpers/rankingsPersistence';

export const RESULTS_VIEW_CONFIGS = [
    {
        key: 'community',
        label: 'Classement Communautaire',
    },
    {
        key: 'individual',
        label: 'Concours Individuel',
    },
];

export const RESULTS_SESSION_CONFIGS = {
    [USER_RANKING_SESSIONS.semiFinal1UserRanking]: {
        sessionKey: USER_RANKING_SESSIONS.semiFinal1UserRanking,
        title: 'Demi-Finale 1',
        participantCodes: semiFinal1Participants,
    },
    [USER_RANKING_SESSIONS.semiFinal2UserRanking]: {
        sessionKey: USER_RANKING_SESSIONS.semiFinal2UserRanking,
        title: 'Demi-Finale 2',
        participantCodes: semiFinal2Participants,
    },
    [USER_RANKING_SESSIONS.finalUserRanking]: {
        sessionKey: USER_RANKING_SESSIONS.finalUserRanking,
        title: 'Grande Finale',
        participantCodes: finalParticipants,
    },
};

export const DEFAULT_RESULTS_SESSION_KEY =
    USER_RANKING_SESSIONS.semiFinal1UserRanking;

export function getResultsSessionConfig(sessionKey) {
    return (
        RESULTS_SESSION_CONFIGS[sessionKey] ??
        RESULTS_SESSION_CONFIGS[DEFAULT_RESULTS_SESSION_KEY]
    );
}
