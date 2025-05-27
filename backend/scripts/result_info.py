#!/usr/bin/env python3
import sys
import json
import fastf1
import pandas as pd

def get_schedule(season):
    """
    Fetch the season schedule using FastF1 and print as JSON.
    """
    schedule_df = fastf1.get_event_schedule(int(season))

    # Dynamically identify the schedule columns
    cols = schedule_df.columns.tolist()
    round_col = next((c for c in cols if 'round' in c.lower()), None)
    name_col  = next((c for c in cols if 'event' in c.lower()), None)
    date_col  = next((c for c in cols if c.lower() == 'date' or 'date' in c.lower()), None)

    if not all([round_col, name_col, date_col]):
        print(f"Available columns: {cols}", file=sys.stderr)
        raise KeyError('Could not find required schedule columns')

    races = []
    for _, row in schedule_df.iterrows():
        races.append({
            'round':    int(row[round_col]),
            'raceName': row[name_col],
            'date':     pd.to_datetime(row[date_col]).strftime('%Y-%m-%d')
        })

    print(json.dumps(races))
    sys.exit(0)

def main():
    args = sys.argv[1:]
    if len(args) == 1:
        # Only season → output full schedule
        get_schedule(args[0])

    if len(args) != 2:
        print(f"Usage: {sys.argv[0]} <season> [GrandPrixName]")
        sys.exit(1)

    season, gp_name = args
    session = fastf1.get_session(int(season), gp_name, 'Race')
    session.load()
    # Build the starting grid from the qualifying results
    df = session.results[['Position', 'FullName']]
    df = df.rename(columns={'Position': 'position', 'FullName': 'driver'})
    records = df.to_dict(orient='records')
    print(json.dumps(records))

if __name__ == '__main__':
    main()