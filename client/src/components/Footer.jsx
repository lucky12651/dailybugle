import React from "react";

const Footer = () => {
  return (
    <footer className="bg-transparent py-6">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-400">
          URL service by{" "}
          <a
            href="https://coffeenblog.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Coffeenblog.com
          </a>{" "}
          &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
