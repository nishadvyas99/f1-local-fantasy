#!/usr/bin/env python3
import sys, json
import fastf1
import pandas as pd

def main():
    season, gp_name = sys.argv[1], sys.argv[2]

    # load qualifying session
    session = fastf1.get_session(int(season), gp_name, 'Qualifying')
    session.load()

    # ** Inspect the columns **
    #print("Columns available:", session.results.columns.tolist(), file=sys.stderr)

    # now you can pick the right names from what you see
    # For example, if the DataFrame shows 'Grid' and 'DriverName', you’d do:
    df = session.results[['Position','FullName']]
    print(json.dumps(df.to_dict(orient='records')))

if __name__ == '__main__':
    main()
