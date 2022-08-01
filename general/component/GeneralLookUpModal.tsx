import { Button, Center, Flex, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Spinner } from '@chakra-ui/react';
import { BiSearchAlt2 } from 'react-icons/bi';
import { useEffect, useRef, useState } from 'react';

import { commonInputProps } from 'general';
import { GeneralObject } from 'type';

// ********************************************************************************
// == Interface ===================================================================
interface Props<T> {
  modalTitle: string;
  inputPlaceholder: string;
  keyToShow: keyof T;
  isOpen: boolean;
  inputValueChangeCallback: (inputValue: string) => Promise<T[]>;
  chosenObjectCallback: (chosenObject: T) => void;
  onClose: () => void;
}

// == Component ===================================================================
export const GeneralLookUpModal = <T extends GeneralObject>({ modalTitle, inputPlaceholder, keyToShow, isOpen, inputValueChangeCallback, chosenObjectCallback, onClose }: Props<T>) => {
  const initialRef = useRef(null);
  // -- State ---------------------------------------------------------------------
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchedElements, setSearchedElements] = useState<T[]>([/*empty on creation by default*/]);

  // -- Effect --------------------------------------------------------------------
  useEffect(() => {
    if(inputValue === '') {
      setSearchedElements([]);
      return;
    }/* else -- searching for objects */

    const searchObjects = async () => {
      try {
        setIsLoading(true);
        const requestedObjects = await inputValueChangeCallback(inputValue);
        if(!requestedObjects) {
          setSearchedElements([]);
          return;
        } /* else -- objects found  */

        setSearchedElements(requestedObjects);
      } catch (error) {
        throw new Error('Something went wrong while searching for objects');
      } finally {
        setIsLoading(false);
      }
    }

    const debouncedSearchAuthors = setTimeout(() => searchObjects(), 500/*ms*/);
    return () => clearTimeout(debouncedSearchAuthors);
  }, [inputValue]);

  // -- UI ------------------------------------------------------------------------
  return (
    <Modal scrollBehavior='inside' initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay bg='blackAlpha.400' />
      <ModalContent>
        <ModalHeader>{modalTitle}</ModalHeader>
        <ModalCloseButton />
        <ModalBody maxHeight='66vh'>
          <InputGroup>
            <InputLeftElement children={<BiSearchAlt2 />} />
            <Input
              ref={initialRef}
              placeholder={inputPlaceholder}
              bg='white'
              onChange={(event) => setInputValue(event.target.value)}
              {...commonInputProps}
            />
          </InputGroup>
          <Flex
            flexDir='column'
            gap={2}
            width='full'
            marginY={'10px'}
          >
            {isLoading
              ?
              <Center>
                <Spinner />
              </Center>
              :
              searchedElements.map((element, elementIndex) =>
                <Button
                  key={elementIndex}
                  colorScheme='twitter'
                  onClick={() => { chosenObjectCallback(element); setSearchedElements([]); }}
                >
                  {element[keyToShow]?.toString()}
                </Button>
              )
            }
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
