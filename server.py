import json
import heapq
from flask import Flask, jsonify, request
from flask_cors import CORS # Import CORS

app = Flask(__name__)
# This line allows your frontend (from localhost:8000)
# to make requests to your backend (at localhost:5000)
CORS(app) 

# --- Load Data and Build Graph ---
# We do this once when the server starts

stops_data = json.load(open('stops.json'))
routes_data = json.load(open('routes.json'))

# Build a graph for Dijkstra's algorithm
# Format: graph[stop_A] = [ (stop_B, 1), (stop_D, 1) ]
graph = {}

# 1. Add all stops as nodes
for stop in stops_data:
    graph[stop['id']] = []

# 2. Add edges (connections) from routes
for route in routes_data:
    stop_list = route['stops']
    # Create connections for each route (in both directions for simplicity)
    for i in range(len(stop_list) - 1):
        stop1 = stop_list[i]
        stop2 = stop_list[i+1]
        
        # Add edge from stop1 to stop2 (weight 1)
        if (stop2, 1) not in graph[stop1]:
            graph[stop1].append((stop2, 1))
            
        # Add edge from stop2 to stop1 (weight 1)
        if (stop1, 1) not in graph[stop2]:
            graph[stop2].append((stop1, 1))

print("Server is ready. Graph built.")

# --- Dijkstra's Algorithm ---
def find_optimal_path(start, end):
    # (distance, current_stop, path_list)
    queue = [(0, start, [start])]
    visited = set()

    while queue:
        (dist, current, path) = heapq.heappop(queue)

        if current in visited:
            continue
        visited.add(current)

        # We found the end!
        if current == end:
            return path

        # Add neighbors to the queue
        for neighbor, weight in graph.get(current, []):
            if neighbor not in visited:
                new_dist = dist + weight
                new_path = path + [neighbor]
                heapq.heappush(queue, (new_dist, neighbor, new_path))
    
    return None # No path found

# --- API Endpoint ---
@app.route('/api/get-route')
def get_route():
    start_stop = request.args.get('start')
    end_stop = request.args.get('end')

    if not start_stop or not end_stop:
        return jsonify({"error": "Missing 'start' or 'end' stop"}), 400

    print(f"Calculating route from {start_stop} to {end_stop}")
    
    # Run the algorithm
    path = find_optimal_path(start_stop, end_stop)
    
    if path:
        return jsonify(path)
    else:
        return jsonify({"error": "No path found"}), 404

# This part is only for when you run "python server.py"
# When using "flask run", it's not needed, but it's good practice.
if __name__ == '__main__':
    app.run(debug=True)