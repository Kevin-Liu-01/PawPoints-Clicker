import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Box, Flex, Text } from "@radix-ui/themes";
import CountUp from "react-countup";

import RenderCards from "./renderCards";

export default function ProxButton(props: {
  count: number;
  oldCount: number;
  setCount: (count: number) => void;
  clickMultiplier: number;
  setClickMultiplier: (clickMultiplier: number) => void;
  lifeTimeEarnings: number;
  setLifetimeEarnings: (lifetimeEarnings: number) => void;
}) {
  const [effect, setEffect] = useState(true);
  const [notifications, setNotifications] = useState<
    { id: number; offset: number }[]
  >([]);
  const [isFlashing, setIsFlashing] = useState(false);

  //return time interval based on count
  function timeInterval() {
    if (props.lifeTimeEarnings < 10) {
      return 500;
    } else if (props.lifeTimeEarnings < 100) {
      return 400;
    } else if (props.lifeTimeEarnings < 1000) {
      return 300;
    } else {
      return 200;
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlashing((prev) => !prev); // Toggle the flashing state every second
    }, timeInterval()); // Flash every second

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Multiplier state logic
  const [trueMultiplier, setTrueMultiplier] = useState(1);
  const [clickQueue, setClickQueue] = useState<number[]>([]);

  const MAX_MULTIPLIER = props.clickMultiplier; // Maximum multiplier value
  const RESET_DELAY = 1000 + 100 * MAX_MULTIPLIER; // Start at 1000ms but scale with more multipliers purchased. Delay in milliseconds to reset the queue

  // Handle multiplier logic - increases as user spam clicks, resets after a delay. Max multiplier is the amount of click multipliers purchased
  useEffect(() => {
    if (clickQueue.length === 0) return;

    const now = Date.now();
    const lastClickTime = clickQueue[clickQueue.length - 1];

    if (lastClickTime !== undefined && now - lastClickTime > RESET_DELAY) {
      setClickQueue([]);
      setTrueMultiplier(1);
    }

    // Cleanup interval
    const interval = setInterval(() => {
      const now = Date.now();
      const updatedQueue = clickQueue.filter(
        (time) => now - time <= RESET_DELAY,
      );
      setClickQueue(updatedQueue);
      setTrueMultiplier(updatedQueue.length || 1);
    }, 100);

    return () => clearInterval(interval);
  }, [clickQueue]);

  // Handle main prox button click
  const handleButtonClick = () => {
    const newId = Date.now();
    const offset = Math.random() * 20 - 10;

    setClickQueue((prevQueue) => {
      const now = Date.now();
      const updatedQueue = [...prevQueue, now].slice(-MAX_MULTIPLIER);
      setTrueMultiplier(updatedQueue.length);
      return updatedQueue;
    });

    setNotifications((prev) => [...prev, { id: newId, offset }]);
    props.setCount(props.count + trueMultiplier);
    props.setLifetimeEarnings(props.lifeTimeEarnings + trueMultiplier);

    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== newId),
      );
    }, 500);
  };

  return (
    <Flex align="center" className="relative z-40 h-full w-full flex-col">
      <Flex
        align="center"
        className="absolute z-50 w-full flex-col bg-red-100/80 py-6 text-3xl font-extrabold"
      >
        <Text>Paw Points: </Text>
        <Flex align="center" justify="center" className="h-[3rem]">
          <Text
            className={`${
              effect &&
              "scale-105 animate-wiggle text-6xl text-orange-900 transition"
            } absolute text-5xl`}
          >
            <CountUp start={props.oldCount} end={props.count} duration={1} />
          </Text>
        </Flex>
      </Flex>

      <Flex
        align="center"
        justify="center"
        className="relative mx-auto h-full w-full"
      >
        <RenderCards clickMultiplier={props.clickMultiplier} />
        <Box className="relative">
          {notifications.map((notification) => (
            <Flex
              justify="center"
              align="center"
              key={notification.id}
              style={{
                position: "absolute",
                transform: `translate(${notification.offset * 8}px, ${notification.offset * 2}px)`,
              }}
              className={`absolute right-0 top--5 z-50 h-16 w-16 animate-shake select-none rounded-full border-2 border-orange-400 bg-orange-100 text-2xl font-bold text-red-600`}
            >
              x{trueMultiplier}
            </Flex>
          ))}
          <button
            onClick={handleButtonClick}
            className={`${
              effect && "bg-orange-100"
            } h-48 w-48 rounded-full bg-orange-400 text-white drop-shadow-lg transition ease-in-out hover:animate-wiggle`}
          >
            <Flex
              justify="center"
              className={`${
                effect && "animate-wiggle"
              } transition duration-200 ease-in-out hover:scale-105`}
            >
              <Image
                src="/images/prox.svg"
                alt="Prox"
                onClick={() => {
                  setEffect(true);
                }}
                onAnimationEnd={() => setEffect(false)}
                height={1000}
                width={1000}
                className={`${
                  effect && "animate-wiggle"
                } h-[90%] transition duration-200 ease-in-out hover:scale-105`}
              />
              <Box
                className={`absolute bottom-[-0.75rem] z-20 h-10 w-10 rounded-full border-2 border-orange-400 transition-colors ${
                  isFlashing ? "bg-green-400" : "bg-red-400"
                }`}
              ></Box>
            </Flex>
          </button>
        </Box>
      </Flex>
    </Flex>
  );
}
