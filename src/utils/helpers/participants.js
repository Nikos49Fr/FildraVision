export function getParticipantSongUrl(participant) {
    if (!participant || typeof participant !== 'object') {
        return null;
    }

    const songUrl = participant.songUrl;

    return typeof songUrl === 'string' && songUrl.length > 0 ? songUrl : null;
}
