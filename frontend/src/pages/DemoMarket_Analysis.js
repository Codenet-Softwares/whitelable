import React, { useState, useEffect } from 'react';

const DemoMarket_Analysis = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Mock API fetch, replace this with your actual API call
    const fetchData = async () => {
      try {
        // Simulating a fetch with your provided data
        const response = {
          data: [
            {
              userName: "tamuser",
              marketName: "marketTom ",
              marketId: "d6d3bd1e-c5d0-4a9d-9f46-f38cacb5f524",
              amount: 500,
              details: [
                {
                  sem: 25,
                  tickets: [
                    "03 Q 00047", "03 R 00047", "03 S 00047", "03 T 00047", "03 U 00047",
                    "04 Q 00047", "04 R 00047", "04 S 00047", "04 T 00047", "04 U 00047",
                    "05 Q 00047", "05 R 00047", "05 S 00047", "05 T 00047", "05 U 00047",
                    "06 Q 00047", "06 R 00047", "06 S 00047", "06 T 00047", "06 U 00047",
                    "07 Q 00047", "07 R 00047", "07 S 00047", "07 T 00047", "07 U 00047"
                  ]
                },
                {
                  sem: 50,
                  tickets: [
                    "29 Q 00044", "29 R 00044", "29 S 00044", "29 T 00044", "29 U 00044",
                    "29 A 00044", "29 B 00044", "29 C 00044", "29 D 00044", "29 E 00044",
                    "30 Q 00044", "30 R 00044", "30 S 00044", "30 T 00044", "30 U 00044",
                    "30 A 00044", "30 B 00044", "30 C 00044", "30 D 00044", "30 E 00044"
                  ]
                }
              ]
            },
            {
              userName: "tomUser01",
              marketName: "marketTom ",
              marketId: "d6d3bd1e-c5d0-4a9d-9f46-f38cacb5f524",
              amount: 75,
              details: [
                {
                  sem: 5,
                  tickets: [
                    "02 C 00009", "02 D 00009", "02 E 00009", "02 G 00009", "02 H 00009"
                  ]
                },
                {
                  sem: 10,
                  tickets: [
                    "02 J 00008", "02 K 00008", "02 L 00008", "02 M 00008", "02 N 00008"
                  ]
                }
              ]
            }
          ]
        };

        // Simulating an async delay
        setTimeout(() => {
          setData(response.data);
          setLoading(false);
        }, 1000);

      } catch (error) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Demo Market Analysis</h1>
      {data.length === 0 ? (
        <p>No data available</p>
      ) : (
        data.map((user, index) => (
          <div key={index} className="user-card">
            <h3>{user.userName} ({user.marketName})</h3>
            <p>Market ID: {user.marketId}</p>
            <p>Amount: {user.amount}</p>

            {user.details.map((detail, detailIndex) => (
              <div key={detailIndex} className="detail-card">
                <h4>Sem: {detail.sem}</h4>
                <ul>
                  {detail.tickets.map((ticket, ticketIndex) => (
                    <li key={ticketIndex}>{ticket}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default DemoMarket_Analysis;
