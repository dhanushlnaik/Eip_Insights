"use client";
import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import PrPage from '@/components/PrPage';

const Test = () => {
  const params = useParams();
  const type = params?.type as string || '';
  const number = params?.number as string || '';

  useEffect(() => {
    console.log("Type:", type);
    console.log("Number:", number);
  }, [type, number]);

  return (
    <div>
      {type && number && (
        <PrPage Type={type} number={number} />
      )}
    </div>
  );
};

export default Test;
