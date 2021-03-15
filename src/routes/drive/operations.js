export default class fileOperations {
  async returnParent(folder_id) {
    const resp = await gapi.client.drive.files.get({
      fileId: folder_id,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      fields: 'name, id, parents, driveId'
    })
    return resp.result.parents[0]
  }
}
