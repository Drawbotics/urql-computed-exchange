type HTTPMethod = 'GET' | 'POST';
type ResponseFunction = (data?: any) => Partial<Response>;
type MockResponse = Partial<Response> | ResponseFunction;
type Mappings = {
  [K in HTTPMethod]?: Record<string, MockResponse>;
};

function mergeMappings(mappingsA: Mappings, mappingsB: Mappings): Mappings {
  return {
    GET: { ...mappingsA.GET, ...mappingsB.GET },
    POST: { ...mappingsA.POST, ...mappingsB.POST },
  };
}

function createMapping(method: HTTPMethod, url: string, response: MockResponse) {
  return { [method]: { [url]: response } };
}

class SimpleMockFetch {
  constructor(private readonly mappings: Mappings = {}) {}

  post(url: string, response: MockResponse) {
    return new SimpleMockFetch(mergeMappings(this.mappings, createMapping('POST', url, response)));
  }

  get(url: string, response: MockResponse) {
    return new SimpleMockFetch(mergeMappings(this.mappings, createMapping('GET', url, response)));
  }

  build(): typeof fetch {
    const mockFetch = async (input: RequestInfo, init: RequestInit = {}) => {
      if (typeof input !== 'string') {
        throw new Error('Unimplemented behavior.');
      }

      const method: HTTPMethod = (init.method as HTTPMethod) ?? 'GET';
      const url = input;

      const response = this.getResponse(method as HTTPMethod, url);

      if (method === 'POST') {
        return typeof response === 'function' ? response(init.body) : response;
      } else {
        return typeof response === 'function' ? response() : response;
      }
    };

    return mockFetch as typeof fetch;
  }

  private getResponse(method: HTTPMethod, url: string): MockResponse {
    const methodMappings = this.mappings[method] ?? {};
    const mockResponse = methodMappings[url];

    if (mockResponse == null) {
      throw new Error(`Mock response not found (method: ${method}, url: ${url}).`);
    }

    return mockResponse;
  }
}

export function createMockFetch() {
  return new SimpleMockFetch();
}
