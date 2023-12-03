import { useState, useEffect } from 'react';
import useLoadBlockchainData from './useLoadBlockchainData';

const useGetAthleteTable = () => {
    const { chainRunner, account, signer } = useLoadBlockchainData();

    const [athleteTable, setAthleteTable] = useState(null);

    const getAthleteData = async () => {
        const newAthleteTable = await chainRunner.connect(signer).athleteTable(account);
        setAthleteTable(newAthleteTable);
    }

    useEffect(() => {
        if (signer && chainRunner && account)
            getAthleteData();

    }, [account, signer, chainRunner])

    return athleteTable;
}

export default useGetAthleteTable;