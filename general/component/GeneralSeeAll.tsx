import { Button, Center, Input, Spinner, Tr, Td } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { CachedPagesMap, GeneralObject } from 'type';

import { GeneralPaginationButtons } from './GeneralPaginationButtons';
import { GeneralTableContainer } from './GeneralTableContainer';

// ********************************************************************************
// == Interface ===================================================================
interface Props<T extends GeneralObject> {
  totalPageObjects: number;
  initialPageObjects: T[];
  tableColumnNames: string[];
  displayedPageObjectProperties: (keyof T)[];
  showLeftButtons: boolean;
  leftButtonsString: string;
  inputValueChangeCallback: (inputValue: string) => Promise<T[]>;
  editRouteCallback: (object: T) => void;
  setPageObjectsCallback: (currentPage: number) => Promise<T[]>;
}

// == Component ===================================================================
export const GeneralSeeAll = <T extends GeneralObject>({ totalPageObjects, initialPageObjects, tableColumnNames, displayedPageObjectProperties, showLeftButtons, leftButtonsString, inputValueChangeCallback, editRouteCallback, setPageObjectsCallback }: Props<T>) => {
  // -- State ---------------------------------------------------------------------
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shownObjects, setShownObjects] = useState<T[]>(initialPageObjects);
  const [cachedPages, setCachedPages] = useState<CachedPagesMap<T>>(new Map([[1/*by definition*/, initialPageObjects]]));
  const [currentPage, setCurrentPage] = useState(1/*start at 1*/);

  // -- Effect --------------------------------------------------------------------
  useEffect(() => {
    if(inputValue === '') {
      const currentPageObjects = cachedPages.get(currentPage);
      if(!currentPageObjects) {
        throw new Error('Undefined objects when they should not');
      } /* else -- set to the objects of the current page */

      setShownObjects(currentPageObjects);
      return;
    }/* else -- searching for objects */

    const searchObjects = async () => {
      try {
        setIsLoading(true);
        const requestedObjects = await inputValueChangeCallback(inputValue);
        if(!requestedObjects) {
          setShownObjects([]);
          return;
        } /* else -- objects found  */

        setShownObjects(requestedObjects);
      } catch (error) {
        throw new Error(`Something went wrong while searching for objects: ${error}`);
      } finally {
        setIsLoading(false);
      }
    }

    const debouncedSearchAuthors = setTimeout(() => searchObjects(), 500/*ms*/);
    return () => clearTimeout(debouncedSearchAuthors);
  }, [inputValue]);

  // -- Handler -------------------------------------------------------------------
  const handlePageChange = async (currentPage: number) => {
    setCurrentPage(currentPage);
    const cachedPageObjects = cachedPages.get(currentPage);
    if(!cachedPageObjects) {
      try {
        setIsLoading(true);
        const requestedObjects = await setPageObjectsCallback(currentPage);

        setCachedPages(cachedPages.set(currentPage, requestedObjects));
        setShownObjects(requestedObjects);
        return;
      } catch (error) {
        throw new Error(`${error}`);
      } finally {
        setIsLoading(false);
      }
    }/* else -- page is cached */

    setShownObjects(cachedPageObjects);
  }

  // -- UI ------------------------------------------------------------------------
  return (
    <>
      <Input
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        placeholder='Escribe para buscar'
        color='black'
      />
      {
        isLoading
          ?
          <Center margin='100px'>
            <Spinner />
          </Center>
          :
          <>
            <GeneralTableContainer columnNames={[...tableColumnNames]}>
              {shownObjects.map((object, objectIndex) =>
                <Tr key={objectIndex}>
                  {displayedPageObjectProperties.map(
                    (objectProperty, objectPropertyIndex) =>
                      <Td key={objectPropertyIndex}>{object[objectProperty]?.toString()}</Td>
                  )}
                  {showLeftButtons
                    ?
                    <Td textAlign='right'>
                      <Button
                        size='sm'
                        colorScheme='twitter'
                        onClick={() => editRouteCallback(object)}
                      >
                        {leftButtonsString}
                      </Button>
                    </Td>
                    : null/*user does not have enough authority to edit objects*/
                  }
                </Tr>
              )}
            </GeneralTableContainer>
          </>
      }
      {
        inputValue || isLoading ? null/*do not show if looking for something*/ :
          <GeneralPaginationButtons
            totalItemAmount={totalPageObjects}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageChangeCallback={() => handlePageChange(currentPage)}
          />
      }
    </>
  )
};