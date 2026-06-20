export default function Footer() {
  return (
    <footer style={{ padding: '3rem 0', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
      <div className="container" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>&copy; {new Date().getFullYear()} CSUNHousing. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Premium Student Housing in California</p>
      </div>
    </footer>
  );
}
