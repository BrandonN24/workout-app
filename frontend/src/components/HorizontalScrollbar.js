import React from 'react';
import { Box, Typography } from '@mui/material';

import ExerciseCard from './ExerciseCard';
import BodyPart from './BodyPart';
import RightArrowIcon from '../assets/icons/right-arrow.png';
import LeftArrowIcon from '../assets/icons/left-arrow.png';

const HorizontalScrollbar = ({ data, bodyParts, setBodyPart, bodyPart }) => {
  const scrollRef = React.useRef(null);

  const handleScroll = (scrollOffset) => {
    scrollRef.current.scrollLeft += scrollOffset;
  };

  return (
    <Box sx={{ overflowX: 'scroll', display: 'flex', alignItems: 'center' }} ref={scrollRef}>
      <Typography onClick={() => handleScroll(-1000)} className="left-arrow">
        <img src={LeftArrowIcon} alt="left-arrow" />
      </Typography>
      {data.map((item) => (
        <Box
          key={item.id || item}
          itemId={item.id || item}
          title={item.id || item}
          m="0 40px"
        >
          {bodyParts ? <BodyPart item={item} setBodyPart={setBodyPart} bodyPart={bodyPart} /> : <ExerciseCard exercise={item} /> }
        </Box>
      ))}
      <Typography onClick={() => handleScroll(1000)} className="right-arrow">
        <img src={RightArrowIcon} alt="right-arrow" />
      </Typography>
    </Box>
  );
};

export default HorizontalScrollbar;