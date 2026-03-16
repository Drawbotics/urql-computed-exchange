/* eslint-disable no-undef */
type HTTPMethod = 'GET' | 'POST';
type MockResponseInit = {
  status?: number;
  json?: () => Promise<any>;
  body?: any;
};
type ResponseFunction = (data?: any) => MockResponseInit;
type MockResponse = MockResponseInit | ResponseFunction;
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

      const mockResponse = this.getResponse(method as HTTPMethod, url);
      const resolved =
        method === 'POST'
          ? typeof mockResponse === 'function'
            ? mockResponse(init.body)
            : mockResponse
          : typeof mockResponse === 'function'
            ? mockResponse()
            : mockResponse;

      const jsonFn = resolved.json ?? (async () => resolved.body ?? {});
      const body = await jsonFn();
      const text = JSON.stringify(body);

      return {
        status: resolved.status ?? 200,
        ok: (resolved.status ?? 200) >= 200 && (resolved.status ?? 200) < 300,
        statusText: 'OK',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        text: async () => text,
        json: async () => body,
      } as unknown as Response;
    };

    return mockFetch as typeof fetch;
  }

  private getResponse(method: HTTPMethod, url: string): MockResponse {
    const methodMappings = this.mappings[method] ?? {};
    const mockResponse = methodMappings[url];

    if (mockResponse == null) {
      throw new Error(`Mock response not found (method: ${method}, url: ${url}).`);
    }

    return mockResponse as MockResponse;
  }
}

export function createMockFetch() {
  return new SimpleMockFetch();
}
