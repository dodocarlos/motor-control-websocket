import fetch from 'node-fetch';
import util from 'util';

import Board from '@schemas/Board';

export const connectionManager = async (event, callback) => {
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
    // If have boardId is a esp8266 board
    if (boardId) {
      const board = await Board.get(boardId);
      if (board) {
        board.connection_id = connectionId;
        board.callback_url = callbackUrl;
        await board.save();
      }
    } else {
      // Else it is a client (web or app)
    }
  }

  callback(null, {
    statusCode: 200,
  });
};

export const togglePinStatus = async (event) => {
  const body = JSON.parse(event.body);
  const { board_id, pin, status } = body.data;

  if (board_id) {
    const board = await Board.get(board_id);
    if (board) {
      let pinStatus = board.pin_status && JSON.parse(board.pin_status);
      if (!pinStatus) pinStatus = {};
      pinStatus[pin] = { ...pinStatus[pin], status };
      board.pin_status = JSON.stringify(pinStatus);
      await board.save();
      // Send message to board
      await fetch(board.callback_url, {
        method: 'POST',
        body: JSON.stringify({
          action: 'togglePinStatus',
          data: {
            pin,
            status,
          },
        }),
      });
    }
  }
};
