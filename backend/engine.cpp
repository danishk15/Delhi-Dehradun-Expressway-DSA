#include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include <map>
#include <queue>
#include <algorithm>

using namespace std;

struct Edge {
    string source, dest;
    int distance, time, toll;
};

struct Graph {
    map<string, vector<Edge>> adj;
    vector<Edge> all_edges;
    vector<string> cities;

    void addEdge(string u, string v, int d, int t, int toll) {
        adj[u].push_back({u, v, d, t, toll});
        adj[v].push_back({v, u, d, t, toll}); // undirected
        all_edges.push_back({u, v, d, t, toll});
    }
};

void loadGraph(string filename, Graph& g) {
    ifstream fin(filename);
    if (!fin) return;
    int V, E;
    fin >> V >> E;
    for(int i=0; i<V; i++) {
        string city; int code;
        fin >> city >> code;
        g.cities.push_back(city);
    }
    for(int i=0; i<E; i++) {
        string u, v; int d, t, toll;
        fin >> u >> v >> d >> t >> toll;
        g.addEdge(u, v, d, t, toll);
    }
}

// Dijkstra to find shortest path based on specific weight (0: distance, 1: time, 2: toll)
void shortestPath(Graph& g, string src, string dest) {
    map<string, int> dist;
    map<string, string> parent;
    for(auto c : g.cities) dist[c] = 1e9;
    
    priority_queue<pair<int, string>, vector<pair<int, string>>, greater<pair<int, string>>> pq;
    
    dist[src] = 0;
    pq.push({0, src});
    
    while(!pq.empty()) {
        auto top = pq.top();
        pq.pop();
        int d = top.first;
        string u = top.second;
        
        if (d > dist[u]) continue;
        
        for(auto edge : g.adj[u]) {
            int weight = edge.distance; // Optimizing for distance for now
            if(dist[u] + weight < dist[edge.dest]) {
                dist[edge.dest] = dist[u] + weight;
                parent[edge.dest] = u;
                pq.push({dist[edge.dest], edge.dest});
            }
        }
    }
    
    // Output JSON
    if (dist[dest] == 1e9) {
        cout << "{\"error\": \"No path found\"}" << endl;
        return;
    }
    
    vector<string> path;
    string curr = dest;
    while(curr != src) {
        path.push_back(curr);
        curr = parent[curr];
    }
    path.push_back(src);
    reverse(path.begin(), path.end());
    
    cout << "{\"path\": [";
    for(int i=0; i<path.size(); i++) {
        cout << "\"" << path[i] << "\"";
        if (i < path.size() - 1) cout << ", ";
    }
    cout << "], \"total_distance\": " << dist[dest] << "}" << endl;
}

// DSU and Kruskal for MST
struct DSU {
    map<string, string> parent;
    string find(string i) {
        if (parent.find(i) == parent.end()) parent[i] = i;
        if (parent[i] == i) return i;
        return parent[i] = find(parent[i]);
    }
    void unite(string i, string j) {
        string root_i = find(i);
        string root_j = find(j);
        if (root_i != root_j) parent[root_i] = root_j;
    }
};

void mst(Graph& g) {
    DSU dsu;
    vector<Edge> result;
    auto edges = g.all_edges;
    sort(edges.begin(), edges.end(), [](Edge a, Edge b) {
        return a.distance < b.distance;
    });
    
    for(auto edge : edges) {
        if (dsu.find(edge.source) != dsu.find(edge.dest)) {
            dsu.unite(edge.source, edge.dest);
            result.push_back(edge);
        }
    }
    
    cout << "{\"mst\": [";
    for(int i=0; i<result.size(); i++) {
        cout << "{\"source\": \"" << result[i].source << "\", \"dest\": \"" << result[i].dest << "\", \"distance\": " << result[i].distance << "}";
        if (i < result.size() - 1) cout << ", ";
    }
    cout << "]}" << endl;
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        cout << "{\"error\": \"Invalid arguments\"}" << endl;
        return 1;
    }
    string command = argv[1];
    Graph g;
    loadGraph("expressway.txt", g);
    
    if (command == "shortest_path" && argc >= 4) {
        shortestPath(g, argv[2], argv[3]);
    } else if (command == "mst") {
        mst(g);
    } else {
        cout << "{\"error\": \"Unknown command\"}" << endl;
    }
    return 0;
}
