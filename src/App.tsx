import OrderBook from './pages/OrderBook';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 640px;
  margin: auto;
`;

function App() {
  return (
    <Container>
      <OrderBook />
    </Container>
  );
}

export default App;
