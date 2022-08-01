import { useToast, Button, Center, Flex, IconButton, Input, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tooltip, Tr, VStack } from '@chakra-ui/react';
import { Book, BookCopy, Genre, User } from '@prisma/client';
import type { GetServerSideProps, NextPage } from 'next';
import Router from 'next/router';
import { getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { AiOutlineBook } from 'react-icons/ai';
import { BiBookOpen } from 'react-icons/bi';
import { VscTriangleDown, VscTriangleUp } from 'react-icons/vsc';

import { applyTaxRateToPrice, isValidEmail, pdfJSONBufferToURL, redirectToLoginObject, setupPriceDisplay, GeneralLookUpModal, GeneralModal, CREATED_AT_ORDER, TOAST_DURATION, TOAST_POSITION } from 'general';
import { isValidSession, getBooks, logRequestError, parseObjectFromServer, performSaleGetRequest, postBookSale, BookSaleEntry } from 'request';
import { AppLayout, CenterLayout } from 'ui';

// ********************************************************************************
// == Constant ====================================================================
const defaultBookSaleEntry: BookSaleEntry = {
  book: { id: '', genre: Genre.FANTASY, name: '', releaseDate: new Date(), createdAt: new Date(), updatedAt: new Date(), authorId: '', },
  bookCopy: { id: '', edition: '', pages: 0, publisher: '', quantityInStock: 0, priceMXN: 0, createdAt: new Date(), updatedAt: new Date(), bookId: '' },
  quantity: 0
};
const defaultBookSaleEntries: BookSaleEntry[] = [defaultBookSaleEntry];

// == Interface ===================================================================
interface ColumnHeader { name: string; isNumeric: boolean; }
interface RegisterSaleProps { user: User; currentTaxRatePercentage: number; }

// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<RegisterSaleProps> = async (context) => {
  // -- Validation ----------------------------------------------------------------
  const session = await getSession(context);
  if(!isValidSession(session)) return redirectToLoginObject/*redirect to login if not authed*/;

  // -- Query ---------------------------------------------------------------------
  const appUser = await prisma.user.findUnique({ where: { email: session.user.email } }),

    allTaxRates = await prisma.taxRate.findMany({ orderBy: { createdAt: CREATED_AT_ORDER } }),
    currentTaxRatePercentage = allTaxRates[0/*most recently registered taxRate*/].percentage;

  // -- Returned Props ------------------------------------------------------------
  return {
    props: {
      user: parseObjectFromServer(appUser),
      currentTaxRatePercentage: parseObjectFromServer(currentTaxRatePercentage),
    }
  };
};

// == Client Side =================================================================
// NOTE: This does not use any generic components for the form since it is 
//       the most complex page of the application
const RegistrarVenta: NextPage<RegisterSaleProps> = ({ user, currentTaxRatePercentage }) => {
  const toast = useToast();

  // -- State ---------------------------------------------------------------------
  const [taxRatePercentage] = useState(currentTaxRatePercentage);

  const [columns, setColumns] = useState<ColumnHeader[]>([]);
  const [bookSaleEntries, setBookSaleEntries] = useState<BookSaleEntry[]>(defaultBookSaleEntries);
  const [showBookLookUpModal, setShowBookLookUpModal] = useState(false);
  const [showBookCopyLookUpModal, setShowBookCopyLookUpModal] = useState(false);

  const [emailInputValue, setEmailInputValue] = useState('');
  const [totalSalePrice, setTotalSalePrice] = useState(0);

  const [showProceedWithSaleModal, setShowProceedWithSaleModal] = useState(false);
  const [isPostingSale, setIsPostingSale] = useState(false);
  const [hasPostedSale, setHasPostedSale] = useState(false);

  // -- Effect --------------------------------------------------------------------
  // NOTE: Set through effect to prevent hydration warnings
  useEffect(() => {/*set initial state*/
    setColumns([
      { name: 'Libro', isNumeric: false },
      { name: 'Edición', isNumeric: false },
      { name: 'Precio (MXN)', isNumeric: true },
      { name: 'Precio con IVA (MXN)', isNumeric: true },
      { name: 'Cantidad', isNumeric: true },
      { name: 'Importe Total (MXN)', isNumeric: true },
    ]);
  }, [/*only on initial render*/]);

  useEffect(() => {/*update totalSalePrice on bookSaleEntries change*/
    let newTotalSalePrice = 0;
    bookSaleEntries.forEach(entry => newTotalSalePrice += applyTaxRateToPrice(entry.bookCopy.priceMXN, currentTaxRatePercentage) * entry.quantity);

    setTotalSalePrice(newTotalSalePrice);
  }, [bookSaleEntries]);

  // -- Handler -------------------------------------------------------------------
  const handleBookSaleEntryBookChange = (chosenBook: Book, modifiedEntry: BookSaleEntry) => {
    const newBookSaleEntries = [...bookSaleEntries],
      modifiedEntryIndex = newBookSaleEntries.indexOf(modifiedEntry);

    newBookSaleEntries[modifiedEntryIndex] = {
      ...modifiedEntry,
      book: chosenBook,
      bookCopy: defaultBookSaleEntry.bookCopy/*reset to default to force choosing again*/,
    }

    setBookSaleEntries(newBookSaleEntries);
  };

  const handleBookSaleEntryBookCopyChange = (chosenBookCopy: BookCopy, modifiedEntry: BookSaleEntry) => {
    const newBookSaleEntries = [...bookSaleEntries],
      modifiedEntryIndex = newBookSaleEntries.indexOf(modifiedEntry);

    newBookSaleEntries[modifiedEntryIndex] = {
      ...modifiedEntry,
      bookCopy: chosenBookCopy/*guaranteed to be a bookCopy of the chosen book by getBookCopies call*/
    }

    setBookSaleEntries(newBookSaleEntries);
  };

  const handleBookSaleEntryQuantityChange = (type: 'increase' | 'decrease', bookSaleEntry: BookSaleEntry) => {
    if(!bookSaleEntry.book.name || !bookSaleEntry.bookCopy.edition) {
      toast({ title: 'Agregue un libro y su edición para cambiar la cantidad.', duration: TOAST_DURATION, position: TOAST_POSITION });
      return/*do not allow quantity increase if there are is no book and bookCopy*/;
    }/* else -- allow modifying quantity*/

    if(type === 'decrease' && bookSaleEntry.quantity - 1 < 0) {
      return/*do not allow negative numbers*/;
    }/* else -- decrease quantity */

    const newBookSaleEntries = [...bookSaleEntries],
      modifiedEntryIndex = newBookSaleEntries.indexOf(bookSaleEntry);
    newBookSaleEntries[modifiedEntryIndex] = {
      ...bookSaleEntry,
      quantity: type === 'increase' ? bookSaleEntry.quantity + 1 : bookSaleEntry.quantity - 1
    }

    setBookSaleEntries(newBookSaleEntries);
  };

  // ..............................................................................
  const confirmSale = async () => {
    try {
      // -- Verify Email Being Valid ------------------------------------
      if(!emailInputValue || emailInputValue.length < 1 || emailInputValue.length > 60/*T&E*/ || !isValidEmail(emailInputValue)) {
        toast({ title: 'Ingrese un correo electrónico de cliente válido', status: 'warning', duration: 7000/*ms*/, position: TOAST_POSITION });
        return;
      }/* else -- valid email */

      // -- Verify Sale Being Valid -------------------------------------
      setIsPostingSale(true);
      const saleRequestAnswer = await performSaleGetRequest(undefined/*get latest sale info*/);
      if(!saleRequestAnswer || !saleRequestAnswer.currentSaleInfo) {
        throw new Error('Something went wrong while querying the latest sale information');
      }/* else -- got valid saleRequest answer */

      const { currentSaleInfo } = saleRequestAnswer,
        { currentTaxRatePercentage: latestTaxPercentage } = currentSaleInfo;
      if(currentTaxRatePercentage !== latestTaxPercentage) {
        toast({ title: 'Los precios han cambiado desde la última vez que fueron consultados. Venta cancelada. Por favor, recargue la página.', status: 'warning', duration: 7000/*ms*/, position: TOAST_POSITION });
        setHasPostedSale(true)/*do not allow to retry*/;
        return;
      }/* else -- taxRate still matches, check prices for bookCopies*/

      let shouldCancelSale = false,
          cancelSaleMessage = '';
      for(const entry of bookSaleEntries) {
        if(!entry.book.id || !entry.bookCopy.id || entry.quantity < 1) {
          shouldCancelSale = true;
          cancelSaleMessage = 'Información de Libros Inválida. Cancelando Venta.'
          return/*do not allow empty books to be sold*/;
        }/* else -- its not an empty book*/

        const currentBookCopyInfo = await performSaleGetRequest({ 
          saleIdStartsWith: ''/*not looking for sales*/, 
          requestedSalesPage: ''/*not looking for a page*/,
          saleId: ''/*not looking for a sale*/, 
          bookCopyId: entry.bookCopy.id, 
          bookId: ''/*not looking for edition names*/, 
          editionNameStartsWith: ''/*not looking for edition names */ 
        })
        if(!currentBookCopyInfo || !currentBookCopyInfo.bookCopy) {
          shouldCancelSale = true;
          return;
        }/* else -- bookCopy still exists, do not modify */

        if(currentBookCopyInfo.bookCopy.priceMXN !== entry.bookCopy.priceMXN) {
          shouldCancelSale = true;
          return;
        }/* else -- price still matches, do not modify */

        if(shouldCancelSale) {
          cancelSaleMessage = 'Los ejemplares o su precio han cambiado desde la última vez que fueron consultados. Venta cancelada. Por favor, recargue la página.';
        }/* else -- do not set cancelSaleMessage */
      }

      if(shouldCancelSale) {
        toast({ title: cancelSaleMessage, status: 'warning', duration: 7000/*ms*/, position: TOAST_POSITION });
        return;
      }/* else -- prices still match, proceed with sale */
      toast({ title: 'Registrando Venta...', status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION });

      const data = await postBookSale({ employeeId: user.id, clientEmail: emailInputValue, requestedSaleId: undefined/*not requesting a sale*/, bookSaleEntries });
      if(!data || !data.requestedSale || !data.requestedSale.pdfBucketRoute) {
        throw new Error('There was an error while registering the book sale');
      }/* else -- successful registering */

      const newSaleData = await performSaleGetRequest({
        saleIdStartsWith: ''/*not looking for sales*/,
        requestedSalesPage: ''/*not looking for a page*/,
        saleId: data.requestedSale.id,
        bookId: ''/*not looking for bookCopies of a bookId*/,
        editionNameStartsWith: ''/*not looking for bookCopies of a bookId*/,
        bookCopyId: '', /*not looking for a specific bookCopy*/
      });
      if(!newSaleData || !newSaleData.salePDFJSONBuffer) {
        throw new Error('PDFBlob was not returned from server');
      }/* else -- got buffer */

      setHasPostedSale(true);
      setIsPostingSale(false);
      window.open(pdfJSONBufferToURL(newSaleData.salePDFJSONBuffer));
      toast({ title: 'Venta registrada exitosamente', status: 'success', duration: TOAST_DURATION, position: TOAST_POSITION });
    } catch (error) {
      logRequestError(error, 'Posting Sale');
      toast({ title: 'Ocurrió un error mientras se registraba la Venta...', status: 'error', duration: TOAST_DURATION, position: TOAST_POSITION });
    } finally {
      setShowProceedWithSaleModal(false);
    }
  };

  // ..............................................................................
  const lookForBook = async (bookNameStartsWith: string) => {
    const data = await getBooks({ requestedBookId: ''/*not requesting a book*/, requestedBookNameStartsWith: bookNameStartsWith, requestedBooksPage: ''/*not requesting a page*/, })
    if(!data || !data.requestedBooks) {
      return [];
    } /* else -- authors found  */
    return data.requestedBooks;
  };

  const chooseBook = (chosenBook: Book, bookSaleEntry: BookSaleEntry) => { 
    handleBookSaleEntryBookChange(chosenBook, bookSaleEntry); 
    setShowBookLookUpModal(false); 
  };

  // ..............................................................................
  const lookForBookCopy = async (bookCopyEditionNameStartsWith: string, bookSaleEntry: BookSaleEntry) => {
    const data = await performSaleGetRequest({ 
      saleIdStartsWith: ''/*not looking for sales*/, 
      requestedSalesPage: ''/*not looking for a page*/,
      saleId: ''/*not looking for a sale*/, 
      bookCopyId: ''/*not looking for a specific bookCopy*/, 
      bookId: bookSaleEntry.book.id, 
      editionNameStartsWith: bookCopyEditionNameStartsWith 
    });
    if(!data || !data.bookCopies) {
      return [];
    } /* else -- authors found  */
    return data.bookCopies;
  };

  const chooseBookCopy = (chosenBookCopy: BookCopy, bookSaleEntry: BookSaleEntry) => { 
    handleBookSaleEntryBookCopyChange(chosenBookCopy, bookSaleEntry); 
    setShowBookCopyLookUpModal(false); 
  };

  // -- UI ------------------------------------------------------------------------
  return (
    <AppLayout
      userId={user.id}
      userIMG={user.image}
      employeeLevel={user.employeeLevel}
    >
      <CenterLayout>
        <VStack
          align='flex-start'
          spacing={4}
        >
          {/* .. Preamble  .................................................... */}
          <Text as='strong'>Registrar Venta</Text>
          <Text>Tasa de IVA Vigente</Text>
          <Input value={`${taxRatePercentage}%`} readOnly />

          {/* .. Table  ....................................................... */}
          <TableContainer width='full'>
            <Table>
              <Thead>
                {/* .. Column Names  .......................................... */}
                <Tr>
                  {columns.map((column, columnIndex) =>
                    column.name === 'Cantidad'/*special case with buttons*/
                      ? <Th key={columnIndex} isNumeric={column.isNumeric}><Center>{column.name}</Center></Th>
                      : <Th key={columnIndex} isNumeric={column.isNumeric}>{column.name}</Th>
                  )}
                </Tr>
              </Thead>

              {/* .. Books in Sale  ............................................... */}
              <Tbody>
                {bookSaleEntries.map((bookSaleEntry, bookSaleEntryIndex) =>
                  <Tr key={bookSaleEntryIndex}>
                    {/* .. Book Name  ........................................... */}
                    <Td>
                      <Flex gap='10px'>
                        <Input value={bookSaleEntry.book.name} placeholder='Nombre del Libro' readOnly />
                        <Tooltip label='Buscar Libro'>
                          <IconButton
                            icon={<AiOutlineBook />}
                            aria-label='searchForBook'
                            isDisabled={isPostingSale || hasPostedSale}
                            onClick={() => setShowBookLookUpModal(true)}
                          />
                        </Tooltip>
                        <GeneralLookUpModal<Book>
                          modalTitle='Escoger Libro'
                          inputPlaceholder='Buscar Libro'
                          keyToShow={'name'}
                          isOpen={showBookLookUpModal}
                          inputValueChangeCallback={lookForBook}
                          chosenObjectCallback={(chosenBook) => chooseBook(chosenBook, bookSaleEntry)}
                          onClose={() => setShowBookLookUpModal(false)}
                        />
                      </Flex>
                    </Td>

                    {/* .. BookCopy Name  ....................................... */}
                    <Td>
                      <Flex gap='10px'>
                        <Input value={bookSaleEntry.bookCopy.edition} placeholder='Edición del Libro' readOnly />
                        <Tooltip label='Buscar Edición'>
                          <IconButton
                            icon={<BiBookOpen />}
                            aria-label='searchForBookCopy'
                            isDisabled={isPostingSale || hasPostedSale}
                            onClick={() => {
                              if(!bookSaleEntry.book.name) {
                                toast({ title: 'Seleccione el libro para seleccionar la edición del ejemplar', duration: TOAST_DURATION, position: TOAST_POSITION });
                                return/*do not allow bookCopy selection without book*/;
                              }/* else -- allow selecting bookCopy */
                              setShowBookCopyLookUpModal(true);
                            }}
                          />
                        </Tooltip>
                        <GeneralLookUpModal<BookCopy>
                          modalTitle='Escoger Edición'
                          inputPlaceholder='Buscar Edición'
                          keyToShow={'edition'}
                          isOpen={showBookCopyLookUpModal}
                          inputValueChangeCallback={(bookCopyEditionNameStartsWith) => lookForBookCopy(bookCopyEditionNameStartsWith, bookSaleEntry)}
                          chosenObjectCallback={(chosenBookCopy) => chooseBookCopy(chosenBookCopy, bookSaleEntry)}
                          onClose={() => setShowBookCopyLookUpModal(false)}
                        />
                      </Flex>
                    </Td>

                    {/* .. BookCopy Price  ...................................... */}
                    <Td isNumeric>{setupPriceDisplay(bookSaleEntry.bookCopy.priceMXN)}</Td>

                    {/* .. BookCopy Price plus TaxRate  ............................. */}
                    <Td isNumeric>{setupPriceDisplay(applyTaxRateToPrice(bookSaleEntry.bookCopy.priceMXN, currentTaxRatePercentage))}</Td>

                    {/* .. BookCopy Quantity  ................................... */}
                    <Td isNumeric>
                      <Flex gap='20px'>
                        <Center flexBasis='50%'>{bookSaleEntry.quantity}</Center>
                        <Flex flexDir='column' gap='10px' marginLeft='auto' float='right'>
                          <Tooltip label='Agregar'>
                            <IconButton
                              icon={<VscTriangleUp />}
                              aria-label='increaseQuantity'
                              isDisabled={isPostingSale || hasPostedSale}
                              onClick={() => handleBookSaleEntryQuantityChange('increase', bookSaleEntry)}
                            />
                          </Tooltip>
                          <Tooltip label='Remover'>
                            <IconButton
                              icon={<VscTriangleDown />}
                              aria-label='decreaseQuantity'
                              isDisabled={isPostingSale || hasPostedSale}
                              onClick={() => handleBookSaleEntryQuantityChange('decrease', bookSaleEntry)}
                            />
                          </Tooltip>
                        </Flex>
                      </Flex>
                    </Td>

                    {/* .. BookCopy Total Price  ................................ */}
                    <Td isNumeric>{setupPriceDisplay(applyTaxRateToPrice(bookSaleEntry.bookCopy.priceMXN, currentTaxRatePercentage) * bookSaleEntry.quantity)}</Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>

          {/* .. Sale Footer .................................................. */}
          <Flex width='full' gap='20px'>
            <Button
              flexBasis='50%'
              isDisabled={isPostingSale || hasPostedSale}
              onClick={() => {
                if(bookSaleEntries.length - 1 < 1) {
                  toast({ title: 'Debe haber por lo menos un libro en el carrito', duration: TOAST_DURATION, position: TOAST_POSITION });
                  return/*do not allow having no bookSaleEntries*/;
                }/* else -- remove last bookSaleEntry */

                const newBookSaleEntries = [...bookSaleEntries];
                newBookSaleEntries.pop();
                setBookSaleEntries(newBookSaleEntries);
              }}
            >
              Remover Libro
            </Button>
            <Button
              flexBasis='50%'
              isDisabled={isPostingSale || hasPostedSale}
              onClick={() => {
                const newBookSaleEntries = [...bookSaleEntries];
                newBookSaleEntries.push(defaultBookSaleEntry);
                setBookSaleEntries(newBookSaleEntries);
              }}
            >
              Agregar Libro
            </Button>
          </Flex>
          <Text>Correo Electrónico del Cliente</Text>
          <Input value={emailInputValue} onChange={(event) => setEmailInputValue(event.target.value)} />

          <Text>Costo de la Venta (MXN)</Text>
          <Input value={setupPriceDisplay(totalSalePrice)} readOnly />

          {/* .. Proceed With Sale Button ..................................... */}
          {hasPostedSale ?
            <Button
              colorScheme='twitter'
              width='full'
              onClick={() => Router.reload()}
            >
              Registrar Otra Venta
            </Button>
            :
            <Button
              colorScheme='twitter'
              width='full'
              isDisabled={isPostingSale || hasPostedSale}
              onClick={() => setShowProceedWithSaleModal(true)}
            >
              Registrar Venta
            </Button>
          }

          {/* .. Proceed With Sale Modal ...................................... */}
          <GeneralModal
            modalTitle='Confirmar Venta'
            bodyString='¿Proceder con la venta?'
            isOpen={showProceedWithSaleModal}
            onClose={() => setShowProceedWithSaleModal(false)}
            buttons={
              [
                {
                  text: 'Cancelar',
                  onClick: () => setShowProceedWithSaleModal(false),
                  isDisabled: isPostingSale || hasPostedSale/*disable while registering the sale or once the sale has been done*/,
                  isLoading: false/*cancel should not be loading*/,
                },
                {
                  text: 'Confirmar Venta',
                  onClick: confirmSale,
                  isDisabled: isPostingSale || hasPostedSale,
                  isLoading: isPostingSale,
                },
              ]
            }
          />
        </VStack>
      </CenterLayout>
    </AppLayout>
  );
};

export default RegistrarVenta;
