const CompetitionHeaders = () => {
    return (
        <div className="flex flex-row flex-nowrap gap-2 overflow-x-auto">
            <div className="border border-gray-300 p-2 flex-grow flex-shrink-0 basis-1/3">
                <b>Name</b>
            </div>
            <div className="border border-gray-300 p-2 flex-grow flex-shrink-0 basis-1/3">
                <b>Status</b>
            </div>
            <div className="border border-gray-300 p-2 flex-grow flex-shrink-0 basis-1/3">
                <b>Actions</b>
            </div>

            {/* <div className="border border-gray-300 p-2 flex-1 md:flex-none md:basis-1/3">
            <b>Staked Amount</b>
        </div>
        <div className="border border-gray-300 p-2 flex-1 md:flex-none md:basis-1/3">
            <b>Start Deadline</b>
        </div>
        <div className="border border-gray-300 p-2 flex-1 md:flex-none md:basis-1/3">
            <b>Winner Address</b>
        </div> */}
        </div>
    )
}

export default CompetitionHeaders
