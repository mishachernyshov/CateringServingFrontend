

export default function Filter ({name, children}) {
  return (
    <div>
      <div className='filter-name'>{name}</div>
      {children}
    </div>
  );
}
