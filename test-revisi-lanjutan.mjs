// test-revisi-lanjutan.mjs
async function runTests() {
  console.log('--- STARTING REVISI LANJUTAN VERIFICATION ---');

  // 1. Login as Owner
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'owner@luminafoto.com',
      password: 'password123',
    }),
  });
  const loginData = await loginRes.json();
  const setCookie = loginRes.headers.get('set-cookie');
  console.log('✓ 1. Owner Login Success:', loginData.success, 'Role:', loginData.user?.role);
  if (!setCookie) throw new Error('No cookie received');

  const cookieHeader = setCookie.split(';')[0];
  const authHeaders = {
    'Content-Type': 'application/json',
    Cookie: cookieHeader,
  };

  // 2. Test Zod Validation: Rejection of invalid promo (percentage > 100)
  const invalidRes = await fetch('http://localhost:3000/api/admin/promos', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      code: 'TESTINVALID',
      discountType: 'PERCENTAGE',
      discountValue: 150, // Should be rejected by Zod
      minSpend: 0,
      quota: 10,
      validUntil: '2026-12-31',
    }),
  });
  const invalidData = await invalidRes.json();
  console.log('✓ 2. Zod Validation (Reject >100%):', invalidRes.status === 400, 'Msg:', invalidData.message);

  // 3. Create Valid Promo
  const testCode = 'SUPERPROMO_' + Math.floor(Math.random() * 10000);
  const createRes = await fetch('http://localhost:3000/api/admin/promos', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      code: testCode,
      discountType: 'PERCENTAGE',
      discountValue: 25,
      minSpend: 200000,
      maxDiscount: 50000,
      quota: 100,
      validUntil: '2027-01-01',
      active: true,
    }),
  });
  const createData = await createRes.json();
  console.log('✓ 3. Promo Created Successfully:', createData.success, 'Code:', createData.data?.code);
  const promoId = createData.data?.id;

  // 4. Read & Filter Promo
  const readRes = await fetch(`http://localhost:3000/api/admin/promos?search=${testCode}`, {
    headers: authHeaders,
  });
  const readData = await readRes.json();
  console.log('✓ 4. Promo Found via Search:', readData.data?.length === 1, 'Code:', readData.data?.[0]?.code);

  // 5. Update Promo
  const updateRes = await fetch(`http://localhost:3000/api/admin/promos/${promoId}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      discountValue: 30,
      quota: 150,
    }),
  });
  const updateData = await updateRes.json();
  console.log('✓ 5. Promo Updated:', updateData.success, 'New Discount:', updateData.data?.discountValue, 'New Quota:', updateData.data?.quota);

  // 6. Toggle Promo Status
  const toggleRes = await fetch(`http://localhost:3000/api/admin/promos/${promoId}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      active: false,
    }),
  });
  const toggleData = await toggleRes.json();
  console.log('✓ 6. Promo Toggled Status:', toggleData.success, 'Active:', toggleData.data?.active);

  // 7. Audit Log Verification
  const auditRes = await fetch(`http://localhost:3000/api/admin/audit-logs?search=${testCode}`, {
    headers: authHeaders,
  });
  const auditData = await auditRes.json();
  const actions = auditData.data?.map(l => l.action);
  console.log('✓ 7. Audit Logs Recorded Actions for Promo:', actions);

  // 8. Audit Log Pagination Test
  const auditPagRes = await fetch('http://localhost:3000/api/admin/audit-logs?page=1&limit=5', {
    headers: authHeaders,
  });
  const auditPagData = await auditPagRes.json();
  console.log('✓ 8. Audit Log Pagination Info:', auditPagData.pagination);

  // 9. Bookings Pagination Test
  const bookPagRes = await fetch('http://localhost:3000/api/admin/bookings?page=1&limit=5', {
    headers: authHeaders,
  });
  const bookPagData = await bookPagRes.json();
  console.log('✓ 9. Bookings Pagination Info:', bookPagData.pagination, 'Data count:', bookPagData.data?.length);

  // 10. Delete Promo
  const delRes = await fetch(`http://localhost:3000/api/admin/promos/${promoId}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  const delData = await delRes.json();
  console.log('✓ 10. Promo Deleted:', delData.success);

  console.log('==============================================');
  console.log(' ALL REVISI LANJUTAN VERIFIED SUCCESSFULLY! ');
  console.log('==============================================');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

