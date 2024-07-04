export default async function TeamsAftersave(req) {
  if (!req.original) {
    try {
      const Ancestors = req.object.get('Ancestors');
      let updatedAncestors;
      if (Ancestors && Ancestors.length > 0) {
        updatedAncestors = [
          ...Ancestors,
          {
            __type: 'Pointer',
            className: 'contracts_Teams',
            objectId: req.object.id,
          },
        ];
      } else {
        updatedAncestors = [
          {
            __type: 'Pointer',
            className: 'contracts_Teams',
            objectId: req.object.id,
          },
        ];
      }
      req.object.set('Ancestors', updatedAncestors);
      await req.object.save(null, { useMasterKey: true });
    } catch (err) {
      console.log('Err in team aftersave', err);
    }
  }
}
