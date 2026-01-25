import React from "react";

const LinkForm = ({
  longUrl,
  setLongUrl,
  customSlug,
  setCustomSlug,
  userId,
  setUserId,
  loading,
  handleSubmit,
  error,
  shortUrl,
  copiedIndex,
  setCopiedIndex,
  copyToClipboard,
}) => {
  return (
    <>
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Shorten a long link
          </h2>
          {/* <p className="text-gray-600 text-sm mb-6">No credit card required.</p> */}

          <label
            htmlFor="longUrl"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Paste your long link here
          </label>
          <input
            type="url"
            id="longUrl"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="https://example.com/my-long-url"
            required
            className="w-full px-6 py-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-500 transition-all duration-200"
          />
        </div>

        <div>
          <label
            htmlFor="customSlug"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Custom Alias (Optional)
          </label>
          <input
            type="text"
            id="customSlug"
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value)}
            placeholder="my-custom-slug"
            className="w-full px-6 py-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-500 transition-all duration-200"
          />
        </div>

        <div>
          <label
            htmlFor="userId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            User ID (Optional) - for tracking specific user traffic
          </label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="user-123"
            className="w-full px-6 py-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-500 transition-all duration-200"
          />
        </div>

        <div className="flex justify-start">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Get your link →"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {shortUrl && (
        <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-800 truncate">
                Your shortened link:
              </p>
              <p className="text-sm text-blue-700 truncate">
                {shortUrl}
                {userId ? `/${userId}` : ""}
              </p>
            </div>
            <button
              onClick={async () => {
                const fullShortUrl = userId
                  ? `${shortUrl}/${userId}`
                  : shortUrl;
                const success = await copyToClipboard(fullShortUrl);
                if (success) {
                  setCopiedIndex(-1);
                  setTimeout(() => setCopiedIndex(null), 2000);
                }
              }}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              {copiedIndex === -1 ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LinkForm;
