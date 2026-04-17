from data import locations

def retrieve(query):
    query = query.lower()

    results = []

    for place in locations:
        if place["category"] in query:
            results.append(place)

    return results