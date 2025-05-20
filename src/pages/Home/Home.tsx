import React from 'react';
import Header from '../../components/layout/Header/Header';
import TokenList from '../../components/common/TokenList/TokenList';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="container mx-auto py-8">
        <TokenList />
      </main>
    </div>
  );
};

export default Home; 