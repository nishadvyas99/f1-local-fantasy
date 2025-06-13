import React, { useMemo,  useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';

export default function Predictions() {
  const [races, setRaces] = useState([]);
  const [selectedRace, setSelectedRace] = useState(null);
  const [expandedRound, setExpandedRound] = useState(null);
  const [grid, setGrid] = useState([]);
  const [order, setOrder] = useState([]);
  const [score, setScore] = useState(null);
  const [hasPrediction, setHasPrediction] = useState(false);
  const navigate = useNavigate();

  // 1. Load all races with a starting grid
  useEffect(() => {
    axios.get('/api/grid')
      .then(res => {
        setRaces(res.data);
        if (res.data.length) {
          // Default to the most recent one
            const last = res.data[res.data.length - 1];
            setSelectedRace(last);
            setExpandedRound(last.round);    
        }
      })
      .catch(console.error);
  }, []);

  // 2. When race changes, fetch full 20-driver grid and user's prediction & score
  useEffect(() => {
    if (!selectedRace) return;
    const season = selectedRace.season;
    const round = selectedRace.round;
    // Fetch full 20-driver grid
    axios.get(`/api/grid/${season}/${round}/grid`)
      .then(res => {
        setGrid(res.data);
        setOrder(res.data.map(e => e.driver));
      })
      .catch(console.error);
    // Fetch existing prediction and score
    const token = localStorage.getItem('token');
    axios.get(`/api/predictions/${season}/${round}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setOrder(res.data.picks);
        setScore(res.data.score);
        setHasPrediction(true);
      })
      .catch(() => {
        setScore(null);
        setHasPrediction(false);
      });
  }, [selectedRace]);

  const isPastRace = useMemo(() => {
  if (!selectedRace) return false;
  const today = new Date().toISOString().slice(0, 10);
  return selectedRace.date < today;
}, [selectedRace]);

  // 3. Handle drag & drop
  const onDragEnd = result => {
    if (!result.destination) return;
    const items = Array.from(order);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setOrder(items);
  };

  // 4. Submit prediction (only top 10)
  const handleSubmit = () => {
    const token = localStorage.getItem('token');
    axios.post(
      '/api/predictions',
      {
        season: selectedRace.season,
        round: selectedRace.round,
        predictions: order.slice(0,10)
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
      .then(() => {
        alert('Prediction saved!');
        window.location.reload();
      })
      .catch(err => alert('Error saving prediction: ' + err.message));
  };

  return (
    <div style={{ padding: '1rem', maxWidth: 600, margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Make Your Predictions</h2>
      </div>

      {/* Race Tabs */}
      <div style={{ display: 'flex', overflowX: 'auto', marginBottom: '1rem' }}>
          {races.map(r => {
          const isPast = Date.now() >= new Date(r.sessionStart).getTime();
          return (
            <button
              key={r.round}
              disabled={isPast}
              onClick={() => {
                if (isPast) return;
                setSelectedRace(r);
                setExpandedRound(prev => prev === r.round ? null : r.round);
              }}
              style={{
                padding: '0.5rem 1rem',
                marginRight: '0.5rem',
                border: selectedRace?.round === r.round ? '2px solid #007bff' : '1px solid #ccc',
                background: selectedRace?.round === r.round ? '#e7f3ff' : '#fff',
                opacity: isPast ? 0.5 : 1,
                cursor: isPast ? 'not-allowed' : 'pointer'
              }}
            >
              {r.raceName}
            </button>
          );
        })}
      </div>

      {/* Expanded Grid & Prediction Section */}
        {selectedRace && expandedRound === selectedRace.round && (() => {
        const now = Date.now();
        const sessionStartMs = new Date(selectedRace.sessionStart).getTime();
        const isPastRace = now >= sessionStartMs;

        return (
          <>
              <div style={{ marginBottom: '1rem' }}>
              {score != null
                ? <p>Your current score: <strong>{score}</strong></p>
                : <p>You have not made a prediction yet.</p>
              }
            </div>

            {isPastRace ? (
              // Read-only results
              <>
                <h3>Results — {selectedRace.raceName}</h3>
                <ol>
                  {grid.map((entry, idx) => (
                    <li key={idx}>{entry.position}. {entry.driver}</li>
                  ))}
                                  </ol>
              </>
            ) : (
              // Prediction UI
              <>
                <h3>Starting Grid — Predict Top 10 ({selectedRace.raceName})</h3>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="grid-droppable">
                    {provided => (
                      <ul
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{ listStyle: 'none', padding: 0 }}
                      >
                        {order.map((driver, index) => (
                          <Draggable
                            key={driver}
                            draggableId={driver}
                            index={index}
                            isDragDisabled={hasPrediction}
                          >
                            {prov => (
                              <li
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '0.75rem',
                                  margin: '0.25rem 0',
                                  border: '1px solid #ccc',
                                  borderRadius: '4px',
                                  background: '#000',
                                  ...prov.draggableProps.style
                                }}
                              >
                                <span style={{ width: 24, marginRight: 8 }}>{index + 1}</span>
                                <span>{driver}</span>
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>

                                <button
                  onClick={handleSubmit}
                  disabled={hasPrediction}
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    background: hasPrediction ? '#ccc' : '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: hasPrediction ? 'not-allowed' : 'pointer'
                  }}
                >
                  {hasPrediction ? 'Prediction Locked' : 'Submit Prediction'}
                </button>
              </>
            )}
          </>
        );
      })()}
        </div>
  );
}