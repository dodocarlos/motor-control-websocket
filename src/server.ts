import util from 'util';

import Board from '@schemas/Board';

export const connectionManager = async (event) => {
  const { boardId } = event.queryStringParameters || '';
  const {
    connectionId,
    routeKey: route,
    stage,
    domainName: domain,
  } = event.requestContext;
  const callbackUrl =
    process.env.STAGE === 'local'
      ? util.format('http://localhost:3001/@connections/%s', connectionId)
      : util.format(
          'https://%s/%s/@connections/%s',
          domain,
          stage,
          connectionId
        );

  if (route === '$connect') {
    const board = await Board.get(boardId);
    if (board) {
      board.connection_id = connectionId;
      board.callback_url = callbackUrl;
      await board.save();
    }
  }
};
