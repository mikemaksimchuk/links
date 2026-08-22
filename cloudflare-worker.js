/**
 * Cloudflare Worker for maksimch.uk/links
 *
 * Route this Worker only to:
 *   maksimch.uk/links*
 *
 * It proxies the GitHub Pages project site while keeping maksimch.uk/links
 * visible in the visitor's address bar. Requests outside /links are rejected
 * as a safeguard because the Worker should never replace the primary website.
 */
export default {
  async fetch(request) {
    const incomingUrl = new URL(request.url);

    if (
      incomingUrl.pathname !== "/links" &&
      !incomingUrl.pathname.startsWith("/links/")
    ) {
      return new Response("Not found", { status: 404 });
    }

    const upstreamUrl = new URL("https://mikemaksimchuk.github.io");
    upstreamUrl.pathname =
      incomingUrl.pathname === "/links"
        ? "/links/"
        : incomingUrl.pathname;
    upstreamUrl.search = incomingUrl.search;

    const upstreamRequest = new Request(upstreamUrl, request);
    const upstreamResponse = await fetch(upstreamRequest);
    const response = new Response(upstreamResponse.body, upstreamResponse);

    // Prevent an upstream redirect from exposing the github.io address.
    const location = response.headers.get("Location");
    if (location) {
      response.headers.set(
        "Location",
        location.replace(
          "https://mikemaksimchuk.github.io/links",
          "https://maksimch.uk/links",
        ),
      );
    }

    return response;
  },
};
