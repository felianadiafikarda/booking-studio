CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS no_overlapping_bookings_per_room;

ALTER TABLE bookings ADD CONSTRAINT no_overlapping_bookings_per_room 
EXCLUDE USING gist ("roomId" WITH =, tsrange("startTime", "endTime") WITH &&) 
WHERE (status IN ('PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED'));

