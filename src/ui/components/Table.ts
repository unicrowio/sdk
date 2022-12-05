import styled from 'styled-components'

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    tr {
      border-bottom: 1px solid #e9eaed;

      th {
        font-family: 'Work Sans';
        font-style: normal;
        font-weight: 500;
        font-size: 14px;
        line-height: 20px;
        padding-bottom: 0.6rem;
        color: #6f7584;
        text-align: left;
      }

      th:last-child {
        text-align: right;
      }
    }
  }

  tbody {
    tr:first-child {
      td {
        padding-top: 1.2rem;
      }
    }

    tr {
      td {
        font-family: 'Work Sans';
        font-style: normal;
        font-weight: 600;
        font-size: 16px;
        line-height: 22%;
        color: #252e47;
        text-align: left;
        padding-bottom: 1.2rem;
      }

      td:last-child {
        text-align: right;
      }
    }
    tr:last-child {
      td {
        padding-bottom: 0;
      }
    }
  }
`
