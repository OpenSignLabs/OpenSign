async function updateEmailName(request, response) {
  const { insuredEmail, insuredName, agentEmail, agentName } = request.body;

  try {
    // Update Insured
    const insuredQuery = new Parse.Query('contracts_Contactbook');
    insuredQuery.equalTo('Email', insuredEmail);
    const insuredContact = await insuredQuery.first({ useMasterKey: true });
    console.log('\n---insuredContact----', insuredContact);

    if (insuredContact) {
      insuredContact.set('Name', insuredName);
      // insuredContact.set('Email', insuredEmail);
      await insuredContact.save(null, { useMasterKey: true });
    }

    // Update Agent
    if (agentEmail && agentName) {
      const agentQuery = new Parse.Query('contracts_Contactbook');
      agentQuery.equalTo('Email', agentEmail);
      const agentContact = await agentQuery.first({ useMasterKey: true });
      console.log('\n---agentContact----', agentContact);

      if (agentContact) {
        agentContact.set('Name', agentName);
        // agentContact.set('Email', agentEmail);
        await agentContact.save(null, { useMasterKey: true });
      }
    }

    return response.json({
      status: 200,
      message: 'Details updated and resent invite successfully.',
    });
  } catch (err) {
    console.log('err in updateEmailName', err);
    return response.status(400).json({ error: err.message });
  }
}

export default updateEmailName;
