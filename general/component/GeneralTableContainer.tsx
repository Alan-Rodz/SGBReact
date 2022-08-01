import { Box, Table, TableContainer, Tbody, Th, Thead, Tr } from '@chakra-ui/react';

// ********************************************************************************
// == Interface ===================================================================
interface Props {
  columnNames: string[];
  children: React.ReactNode;
}

// == Component ===================================================================
export const GeneralTableContainer: React.FC<Props> = ({ columnNames, children }) => {
  return (
    <Box>
      <TableContainer>
        <Table size='sm'>
          <Thead>
            <Tr>
              {columnNames.map((columnName, columnNameIndex) => <Th key={columnNameIndex}>{columnName}</Th>)}
            </Tr>
          </Thead>
          <Tbody>
            {children}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};
