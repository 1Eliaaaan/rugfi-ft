import React from 'react';
import Header from '../../components/layout/Header/Header';
import TokenList from '../../components/common/TokenList/TokenList';

const Home: React.FC = () => {
  return (
    <div className=" bg-black flex flex-col h-screen">
      <Header />
      <div className=" py-8 flex-1">
        <TokenList />
      </div>
    </div>
  );
};

export default Home; 