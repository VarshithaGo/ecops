UPDATE arrest_warrants SET status = 'ISSUED'   WHERE status = 'GRANTED';
UPDATE arrest_warrants SET status = 'REJECTED'  WHERE status = 'DENIED';
