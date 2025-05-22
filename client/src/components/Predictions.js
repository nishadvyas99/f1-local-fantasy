import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function Predictions() {
  const [races, setRaces] = useState([]);
  const [selectedRace, setSelectedRace] = useState(null);
  const [grid, setGrid] = useState([]);
  const [order, setOrder] = useState([]);

  // 1. Load all races with a starting grid
  useEffect(() => {
    axios.get('/api/grid')
      .then(res => {
        setRaces(res.data);
        if (res.data.length) {
          // Default to the most recent one
          setSelectedRace(res.data[res.data.length - 1]);
        }
      })
      .catch(console.error);
  }, []);

  // 2. When race changes, fetch its top-10 grid
  useEffect(() => {
    if (!selectedRace) return;
    axios.get(`/api/grid/${selectedRace.season}/${selectedRace.round}/grid`)
      .then(res => {
        const top10 = res.data.slice(0, 10);
        setGrid(top10);
        // initial order = driver names
        setOrder(top10.map(e => e.driver));
      })
      .catch(console.error);
  }, [selectedRace]);

  // 3. Handle drag & drop
  const onDragEnd = result => {
    if (!result.destination) return;
    const items = Array.from(order);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setOrder(items);
  };

  // 4. Submit prediction
  const handleSubmit = () => {
    const token = localStorage.getItem('token');
  axios.post(
    '/api/predictions',
    {
      season: selectedRace.season,
      round: selectedRace.round,
      predictions: order    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
    .then(() => alert('Prediction saved!'))
    .catch(err => alert('Error saving prediction: ' + err.message));
  };

  return (
    <div style={{ padding: '1rem', maxWidth: 600, margin: 'auto' }}>
      <h2>Make Your Predictions</h2>

      {/* Race Tabs */}
      <div style={{ display: 'flex', overflowX: 'auto', marginBottom: '1rem' }}>
        {races.map(r => (
          <button
            key={r.round}
            onClick={() => setSelectedRace(r)}
            style={{
              padding: '0.5rem 1rem',
              marginRight: '0.5rem',
              border: selectedRace?.round === r.round ? '2px solid #007bff' : '1px solid #ccc',
              background: selectedRace?.round === r.round ? '#e7f3ff' : '#fff',
              cursor: 'pointer'
            }}
          >
            {r.raceName}
          </button>
        ))}
      </div>

      {/* Starting Grid Drag-and-Drop */}
      {selectedRace && (
        <>
          <h3>Starting Grid — Top 10 ({selectedRace.raceName})</h3>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="grid-droppable">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ listStyle: 'none', padding: 0 }}
                >
                  {order.map((driver, index) => (
                    <Draggable key={driver} draggableId={driver} index={index}>
                      {(prov) => (
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
                            background: '#fafafa',
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
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Submit Prediction
          </button>
        </>
      )}
    </div>
  );
}