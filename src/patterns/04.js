import React, {
  useState,
  useLayoutEffect,
  useCallback,
  createContext,
  useMemo,
  useContext,
  useEffect,
  useRef
} from "react";
import mojs from "mo-js";
import styles from "./index.css";
import userStyles from "./usage.css";
// hooks

const useClapAnimation = ({ clapEl, countEl, totalEl }) => {
  const [animationTimeline, setAnimationTimeline] = useState(
    () => new mojs.Timeline()
  );
  useLayoutEffect(() => {
    if (!clapEl || !totalEl || !countEl) {
      return;
    }
    const duration = 300;
    const scaleButtom = new mojs.Html({
      el: clapEl,
      duration: duration,
      scale: { 1.3: 1 },
      easing: mojs.easing.out
    });

    const triangleBurst = new mojs.Burst({
      parent: clapEl,
      radius: { 50: 95 },
      count: 5,
      angle: 30,
      children: {
        shape: "polygon",
        radius: { 9: 0 },
        scale: 1,
        stroke: "rgba(211,84,0 ,0.5)",
        strokeWidth: 2,
        angle: 210,
        delay: 30,
        speed: 0.2,
        easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
        duration: duration
      }
    });

    const circleBurst = new mojs.Burst({
      parent: clapEl,
      radius: { 50: 75 },
      angle: 25,
      children: {
        shape: "circle",
        fill: "rgba(149,165,166 ,0.5)",
        stroke: 3,
        delay: 30,
        speed: 0.2,
        radius: { 3: 0 },
        easing: mojs.easing.bezier(0.1, 1, 0.3, 1)
      }
    });

    const clapCountAnimation = new mojs.Html({
      el: countEl,
      opacity: { 0: 1 },
      duration: duration,
      y: { 0: -30 }
    }).then({
      opacity: { 1: 0 },
      delay: duration / 2,
      y: -100
    });
    const countTotalAnimation = new mojs.Html({
      el: totalEl,
      opacity: { 0: 1 },
      delay: (3 * duration) / 2,
      duration: duration,
      y: { 0: -3 }
    });

    //resetting the scale to 1
    if (typeof clapEl === "string") {
      const clap = document.getElementById("clap2");
      clap.style.transform = "scale(1,1)";
    } else {
      clapEl.style.transform = "scale(1,1)";
    }

    const newAnimationTimeline = animationTimeline.add([
      scaleButtom,
      countTotalAnimation,
      clapCountAnimation,
      triangleBurst,
      circleBurst
    ]);
    setAnimationTimeline(newAnimationTimeline);
  }, [clapEl, totalEl, countEl]);

  return animationTimeline;
};

//-------------------

const MediumClapContext = createContext();
const Provider = MediumClapContext.Provider;
const initialState = {
  count: 0,
  totalCount: 121,
  isClicked: false
};
const MediumClap = ({
  children,
  onClap,
  className = "",
  style: userStyles = {}
}) => {
  const MAX_USER_CLICKS = 10;
  const [clapState, updateClapState] = useState(initialState);
  const { count, totalCount, isClicked } = clapState;

  const [{ refClap, refClapCount, refClapTotal }, setRefState] = useState({});

  const componentJustMounted = useRef(true);
  useEffect(() => {
    if (!componentJustMounted.current) {
      console.log("clapped");
      onClap && onClap(clapState);
    }
    componentJustMounted.current = false;
  }, [count]);

  const setRef = useCallback(node => {
    setRefState(prevRefState => ({
      ...prevRefState,
      [node.dataset.refkey]: node
    }));
  }, []);

  const animationTimeline = useClapAnimation({
    clapEl: refClap,
    countEl: refClapCount,
    totalEl: refClapTotal
  });
  const clapClickHandler = () => {
    animationTimeline.replay();
    updateClapState(prevState => ({
      isClicked: true,
      count: Math.min(prevState.count + 1, MAX_USER_CLICKS),
      totalCount:
        prevState.count < MAX_USER_CLICKS
          ? prevState.totalCount + 1
          : prevState.totalCount
    }));
  };

  const providerState = useMemo(
    () => ({
      ...clapState,
      setRef
    }),
    [clapState]
  );
  const classNames = [styles.clap, className].join(" ").trim();

  return (
    <Provider value={providerState}>
      <button
        ref={setRef}
        data-refkey="refClap"
        className={classNames}
        onClick={clapClickHandler}
      >
        {children}
      </button>
    </Provider>
  );
};

const ClapIcon = ({ className = "", style: userStyles = {} }) => {
  const { isClicked } = useContext(MediumClapContext);
  const classNames = [styles.icon, isClicked ? styles.checked : "", className]
    .join(" ")
    .trim();

  return (
    <span>
      <svg
        id="clapIcon2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-549 338 100.1 125"
        className={classNames}
      >
        <path d="M-471.2 366.8c1.2 1.1 1.9 2.6 2.3 4.1.4-.3.8-.5 1.2-.7 1-1.9.7-4.3-1-5.9-2-1.9-5.2-1.9-7.2.1l-.2.2c1.8.1 3.6.9 4.9 2.2zm-28.8 14c.4.9.7 1.9.8 3.1l16.5-16.9c.6-.6 1.4-1.1 2.1-1.5 1-1.9.7-4.4-.9-6-2-1.9-5.2-1.9-7.2.1l-15.5 15.9c2.3 2.2 3.1 3 4.2 5.3zm-38.9 39.7c-.1-8.9 3.2-17.2 9.4-23.6l18.6-19c.7-2 .5-4.1-.1-5.3-.8-1.8-1.3-2.3-3.6-4.5l-20.9 21.4c-10.6 10.8-11.2 27.6-2.3 39.3-.6-2.6-1-5.4-1.1-8.3z" />
        <path d="M-527.2 399.1l20.9-21.4c2.2 2.2 2.7 2.6 3.5 4.5.8 1.8 1 5.4-1.6 8l-11.8 12.2c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l34-35c1.9-2 5.2-2.1 7.2-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l28.5-29.3c2-2 5.2-2 7.1-.1 2 1.9 2 5.1.1 7.1l-28.5 29.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.4 1.7 0l24.7-25.3c1.9-2 5.1-2.1 7.1-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l14.6-15c2-2 5.2-2 7.2-.1 2 2 2.1 5.2.1 7.2l-27.6 28.4c-11.6 11.9-30.6 12.2-42.5.6-12-11.7-12.2-30.8-.6-42.7m18.1-48.4l-.7 4.9-2.2-4.4m7.6.9l-3.7 3.4 1.2-4.8m5.5 4.7l-4.8 1.6 3.1-3.9" />
      </svg>
    </span>
  );
};

const ClapCount = ({ className = "", style: userStyles = {} }) => {
  const { count, setRef } = useContext(MediumClapContext);
  const classNames = [styles.total, className].join(" ").trim();

  return (
    <span ref={setRef} data-refkey="refClapCount" className={classNames}>
      + {count}
    </span>
  );
};
const ClapTotal = ({ className = "", style: userStyles = {} }) => {
  const { totalCount, setRef } = useContext(MediumClapContext);
  const classNames = [styles.total, className].join(" ").trim();
  return (
    <span ref={setRef} data-refkey="refClapTotal" className={classNames}>
      {totalCount}
    </span>
  );
};
MediumClap.Icon = ClapIcon;
MediumClap.Count = ClapCount;
MediumClap.Total = ClapTotal;

const Usage = () => {
  const [count, setCount] = useState(0);
  const clapHandler = ({ count }) => {
    setCount(count);
  };
  return (
    <div>
      <MediumClap onClap={clapHandler} className={userStyles.clap}>
        <MediumClap.Icon className={userStyles.icon} />
        <MediumClap.Count className={userStyles.count} />
        <MediumClap.Total className={userStyles.total} />
      </MediumClap>
      <div>{`You have clapped ${count} times`}</div>
    </div>
  );
};

export default Usage;
