"use client"

import React from 'react';
import CreateStoreForm from '../../components/store/CreateStoreForm';

const NewStorePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <CreateStoreForm />
    </div>
  );
};

export default NewStorePage;