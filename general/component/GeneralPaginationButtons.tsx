import { Button, Flex, IconButton, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger } from '@chakra-ui/react';
import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { GrFormNext, GrFormPrevious } from 'react-icons/gr';

import { useLayoutProvider } from 'ui';
import { PAGINATION_SIZE } from 'general';

// ********************************************************************************
// == Constant ====================================================================
const MIN = 1;
const DOTS = '...';

// == Interface ===================================================================
interface Props {
  totalItemAmount: number;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  pageChangeCallback: (currentPage: number) => void;
}

// == Component ===================================================================
export const GeneralPaginationButtons: React.FC<Props> = ({ totalItemAmount, currentPage, setCurrentPage, pageChangeCallback }) => {
  // -- State ---------------------------------------------------------------------
  const { isPhone } = useLayoutProvider();
  const [minMax, setMinMax] = useState<{ min: 1/*by definition*/; max: number; }>({ min: MIN, max: Math.ceil(totalItemAmount / PAGINATION_SIZE) });
  const [isLeftPopOverOpen, setIsLeftPopOverOpen] = useState(false);
  const [pageButtons, setPageButtons] = useState<(string | number)[]>([]);
  const [isRightPopOverOpen, setIsRightPopOverOpen] = useState(false);

  // -- Effect --------------------------------------------------------------------
  // Update pageButtons
  useEffect(() => {
    const newPageButtons = computeNewPageButtons(currentPage, minMax.min, minMax.max);
    setPageButtons(newPageButtons);
  }, [currentPage, totalItemAmount]);

  // Update minMax
  useEffect(() => {
    setMinMax({ min: MIN, max: Math.ceil(totalItemAmount / PAGINATION_SIZE) });
  }, [totalItemAmount]);

  // Trigger callback
  useEffect(() => {
    pageChangeCallback(currentPage);
  }, [currentPage]);

  // Close pop overs if click happens outside of them
  useEffect(() => {
    if(!isLeftPopOverOpen && !isRightPopOverOpen) return/*nothing to do*/;

    const handleClickOutsidePopOvers = () => {
      setIsLeftPopOverOpen(false);
      setIsRightPopOverOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutsidePopOvers);
    return () => document.removeEventListener('mousedown', handleClickOutsidePopOvers);
  }, [isLeftPopOverOpen, isRightPopOverOpen]);

  // -- Handler -------------------------------------------------------------------
  const handlePreviousPageClick = () => 
    setCurrentPage(prevState => (prevState - 1 > 0) 
      ? (prevState - 1) 
      : prevState/*do not allow going below zero*/)

  const handleDotsButtonClick = (pageButtonNumberIndex: number) => {
    if(pageButtons[pageButtonNumberIndex - 1] === MIN) {
      setIsLeftPopOverOpen(true);
      setIsRightPopOverOpen(false);
      return;
    }/* else -- clicking on right '...' button */
    setIsRightPopOverOpen(true);
    setIsLeftPopOverOpen(false);
  }

  const handleButtonClick = (pageButtonNumberIndex: number, clickedPageNumber: number) => { 
    // close left or right pop over depending on index
    if(pageButtonNumberIndex < currentPage) {
      setIsLeftPopOverOpen(false);
    } else {
      setIsRightPopOverOpen(false);
    }

    // set currentPage to chosen page
    setCurrentPage(Number(clickedPageNumber)); 
  }

  const handleNextPageClick = () => 
    setCurrentPage(prevState => (prevState + 1 <= Math.ceil(totalItemAmount / PAGINATION_SIZE)) 
      ? (prevState + 1) 
      : prevState/*do not alow going past the amount of pages*/)

  // -- UI ------------------------------------------------------------------------
  return (
    <Flex gap='10px'>
      <IconButton
        flex='1 1 0'
        icon={<GrFormPrevious size='1em' />}
        aria-label='previousPage'
        onClick={handlePreviousPageClick}
      />
      {isPhone ? null/*only show left and right arrows*/ : pageButtons.map((pageButtonNumber, pageButtonNumberIndex) =>
        typeof pageButtonNumber === 'number'
          ?
          <Button
            key={pageButtonNumberIndex}
            flex='1 1 0'
            colorScheme={pageButtonNumber === currentPage ? 'twitter' : 'gray'}
            onClick={() => setCurrentPage(pageButtonNumber)}
          >
            {pageButtonNumber}
          </Button>
          :
          <Popover
            key={pageButtonNumberIndex}
            placement='top'
            isOpen={pageButtons[pageButtonNumberIndex - 1] === MIN ? isLeftPopOverOpen : isRightPopOverOpen}
          >
            <PopoverTrigger>
              <Button onClick={() => handleDotsButtonClick(pageButtonNumberIndex)}>...</Button>
            </PopoverTrigger>
            <PopoverContent width='600px'>
              <PopoverArrow />
              <PopoverBody>
                <Flex
                  wrap='wrap'
                  gap='5px'
                >
                  {createPaginationDotArray(pageButtons, pageButtonNumberIndex, minMax.max).map((number, numberIndex) =>
                    <Button
                      key={numberIndex}
                      flex='1 1 0'
                      onClick={() => handleButtonClick(pageButtonNumberIndex, number)}
                    >
                      {number}
                    </Button>
                  )}
                </Flex>
              </PopoverBody>
            </PopoverContent>
          </Popover>
      )}
      <IconButton
        flex='1 1 0'
        icon={<GrFormNext size='1em' />}
        aria-label='nextPage'
        onClick={handleNextPageClick}
      />
    </Flex >
  );
};

// == Util ========================================================================
/**
 * Computes the pages array given the currentPage
 * @param currentPage The current page of the pagination
 * @param min The minimum value for of the pages
 * @param max The maximum value for a page
 */
const computeNewPageButtons = (currentPage: number, min: number, max: number) => {
  const newPageButtons: (string | number)[] = [];
  if(currentPage !== MIN)
    newPageButtons.push(min);
  /* else -- do not add min */

  // Defaults
  let addLeftDots = false,
    addRightDots = false;

  if(currentPage - min >= PAGINATION_SIZE)
    addLeftDots = true;
  /* else -- do not modify */

  if(max - currentPage >= PAGINATION_SIZE)
    addRightDots = true;
  /* else -- do not modify */

  // -- Check no dots case --------------------------------------------------------
  if(!addLeftDots && !addRightDots) {
    const distance = max - min + 1/*include max*/;
    return Array.from(Array(distance).keys(), (number, numberIndex) => number = numberIndex + 1/*account for 0 indexing*/);
  }/* else -- dots added */

  // -- Check Left of middle ------------------------------------------------------
  if(addLeftDots) {
    newPageButtons.push(DOTS);
  } else {
    // Add left
    const invertedItemsToLeft = [];
    for (let i = currentPage - 1/*do not include current page*/; i > min; i--)
      invertedItemsToLeft.push(i);
    invertedItemsToLeft.reverse().forEach(numToLeft => newPageButtons.push(numToLeft));

    // Add Right
    const invertedItemsToRight = [];
    for (let i = currentPage; i < min + PAGINATION_SIZE; i++) {
      invertedItemsToRight.push(i);
    }

    invertedItemsToRight.forEach(numToRight => newPageButtons.push(numToRight));
  }

  // -- Middle Case ---------------------------------------------------------------
  if(addLeftDots && addRightDots) {
    newPageButtons.push(currentPage - 1);
    newPageButtons.push(currentPage);
    newPageButtons.push(currentPage + 1);
  }

  // -- Check Right of Middle -----------------------------------------------------
  if(addRightDots) {
    newPageButtons.push(DOTS);
  } else {
    // Add left
    const invertedItemsToLeft = [];
    for (let i = currentPage; i > max - PAGINATION_SIZE; i--)
      invertedItemsToLeft.push(i);
    invertedItemsToLeft.reverse().forEach(numToLeft => newPageButtons.push(numToLeft));

    // Add Right
    const invertedItemsToRight = [];
    for (let i = currentPage + 1; i < max; i++) {
      invertedItemsToRight.push(i);
    }
    invertedItemsToRight.forEach(numToRight => newPageButtons.push(numToRight));
  }

  if(currentPage !== max)
    newPageButtons.push(max);

  return newPageButtons;
}

/**
 * Computes the arrays that correspond to the left or right pagination buttons
 * depending on the current pageButtonNumber
 */
const createPaginationDotArray = (pageButtons: (string | number)[], currentPageButtonNumber: number, max: number) => {
  const valueToTheLeft = Number(pageButtons[currentPageButtonNumber - 1/*before it*/]),
    valueToTheRight = Number(pageButtons[currentPageButtonNumber + 1/*after it*/]);

  if(valueToTheLeft === MIN/*left dots by contract*/) {
    const distance = (valueToTheRight - MIN) - 1/*do not include valueToTheLeft (min)*/;
    return Array.from(Array(distance), (value, index) => value = (index + 1/*account for 0 indexing*/) + valueToTheLeft);
  }/* else -- right dots */

  if(valueToTheRight === max/*right dots by contract*/) {
    const distance = (valueToTheRight - valueToTheLeft) - 1/*do not include valueToTheRight (max)*/;
    return Array.from(Array(distance), (value, index) => value = (index + 1/*account for 0 indexing*/) + valueToTheLeft);
  }/* else -- something went wrong */

  throw new Error('Invalid pageButtons ordering');
};
