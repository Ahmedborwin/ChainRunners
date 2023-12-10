import styled from "styled-components"
const CompetitionHeaders = () => {
    const FlexGridContainer = styled.div`
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 2px; /* Adjust the gap as needed */
        overflow-x: auto; /* Add horizontal scrolling if items overflow */
    `
    const GridItem = styled.div`
        border: 1px solid #ccc;
        padding: 10px;
        box-sizing: border-box;
        flex: 0 1 auto; /* Allow shrinking but not growing */
        min-width: 130px; /* Set a minimum width for each item */

        /* Default flex-basis for small screens (e.g., mobile devices) */
        flex-basis: calc(100% - 10px); /* Full width minus the gap */

        /* Medium screens (e.g., tablets) */
        @media (min-width: 600px) {
            flex-basis: calc(50% - 10px); /* Half width for 2 items per row */
        }

        /* Large screens (e.g., desktops) */
        @media (min-width: 1024px) {
            flex-basis: calc(33.333% - 10px); /* One-third width for 3 items per row */
        }

        /* Extra large screens */
        @media (min-width: 1440px) {
            flex-basis: calc(25% - 10px); /* One-fourth width for 4 items per row */
        }
    `
    return (
        <FlexGridContainer>
            <GridItem>
                <b>Name</b>
            </GridItem>
            <GridItem>
                <b>Status</b>
            </GridItem>

            <GridItem>
                <b>Staked Amount</b>
            </GridItem>
            <GridItem>
                <b>Start Deadline</b>
            </GridItem>
            <GridItem>
                <b>Actions</b>
            </GridItem>

            <GridItem>
                <b>Winner Address</b>
            </GridItem>
        </FlexGridContainer>
    )
}

export default CompetitionHeaders
