import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import io from 'socket.io-client';


const useSocket = (url: string): typeof Socket | null => {
  const [socket, setSocket] = useState<typeof Socket | null>(null);

  useEffect(() => {
    const socketIo = io(url);
    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [url]);

  return socket;
};

export default useSocket;
