import App from 'next/app';
import { SWRConfig } from 'swr';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Roboto';
  }
`;

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;

    return (
      <SWRConfig
        value={{
          // @ts-ignore
          fetcher: (...args) => fetch(...args).then(res => res.json()),
        }}
      >
        <GlobalStyle />
        <Component {...pageProps} />
      </SWRConfig>
    );
  }
}

export default MyApp;
