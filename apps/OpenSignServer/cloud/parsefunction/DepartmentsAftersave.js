export default async function DepartmentsAftersave(req) {
  if (!req.original) {
    try {
      const Ancestors = req.object.get('Ancestors');
      let updatedAncestors;
      if (Ancestors && Ancestors.length > 0) {
        updatedAncestors = [
          ...Ancestors,
          {
            __type: 'Pointer',
            className: 'contracts_Departments',
            objectId: req.object.id,
          },
        ];
      } else {
        updatedAncestors = [
          {
            __type: 'Pointer',
            className: 'contracts_Departments',
            objectId: req.object.id,
          },
        ];
      }
      req.object.set('Ancestors', updatedAncestors);
      await req.object.save(null, { useMasterKey: true });
    } catch (err) {
      console.log('Err in department aftersave', err);
    }
  }
}
