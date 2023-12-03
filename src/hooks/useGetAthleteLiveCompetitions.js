import { useState, useEffect } from 'react';
import useLoadBlockchainData from './useLoadBlockchainData';

const useGetAthleteLiveCompetitions = () => {
    const { chainRunner, signer, account } = useLoadBlockchainData();

    const [athleteLiveCompetitions, setAthleteLiveCompetitions] = useState([]);

    const competitionIsLive = async (competitionId) => await chainRunner.connect(signer).competitionIsLive(competitionId.parseInt());
    const competitionTable = async (competitionId) => await chainRunner.connect(signer).competitionTable(competitionId.parseInt());

    const getAthleteCompetitions = async () => {
        const competitions = await chainRunner.connect(signer).listAthleteCompetitions(account);

        const liveCompetitions = competitions.map(competitionId => {
            if (competitionIsLive(competitionId))
                return competitionTable(competitionId);
        })

        setAthleteLiveCompetitions(liveCompetitions);
    }

    useEffect(() => {
        if (chainRunner && signer && account)
            getAthleteCompetitions();
    }, [chainRunner, signer, account])

    return athleteLiveCompetitions;
}

export default useGetAthleteLiveCompetitions;