import React from "react";

const Header = () => {
  return (
    <header className="bg-transparent">
      <div className="max-w-[800px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          URL Shortener
        </h1>
      </div>
    </header>
  );
};

export default Header;
