
export default function Card() {

    const cardStyle = {
        backgroundColor: 'white',
        width: '232px',
        height: '340px',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        display: 'inline-flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
        margin: '16px',
    }

    const cardTitleStyle = {
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'black',
    }
    const cardContentStyle = {
        fontSize: '16px',
        color: 'black',
    }


    return (
        <div className="card" style={cardStyle}>
            <div className="card-title" style={cardTitleStyle}>Card Title</div>
            <div className="card-content" style={cardContentStyle}>Card Content</div>
        </div>
    )
}