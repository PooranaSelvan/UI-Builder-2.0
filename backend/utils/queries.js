export const SampleQuery = "";

export const loginUserQuery = "SELECT * FROM users where email = ?";

export const signUpUserQuery = "INSERT INTO users(name, email, password, userStatus) values(?, ?, ?, ?)";

export const selectProjectById = "SELECT * FROM projects WHERE projectId = ?";

export const selectUserById = "SELECT * FROM users WHERE userId = ?";

export const selectUserByEmail = "SELECT * FROM users where email = ?";

export const saveNewPageQuery = "INSERT INTO pages(projectId, pageName, description, data, isPublished, url, lastModified) values(?, ?, ?, ?, ?, ?, NOW())";

export const saveNewComponent = "INSERT INTO components(userId, icon, componentName, data, lastModified) values(?, ?, ?, ?, ?)";

export const saveNewProject = "INSERT INTO projects(userId, projectName, description, isPublished) values(?, ?, ?, ?)";

export const selectProjectByUserId = "SELECT * FROM projects where userId = ?";

export const getUserPagesQuery = `SELECT  projects.projectId, projects.userId, projects.projectName, projects.description, projects.isPublished, pages.pageId, pages.pageName, pages.description AS pageDescription, pages.data AS pageData, pages.lastModified, pages.isPublished AS pagePublished, pages.url FROM projects LEFT JOIN pages ON projects.projectId = pages.projectId WHERE projects.userId = ?;`;

export const getUserComponentsQuery = "SELECT * FROM components WHERE userId = ?";

export const deleteProjectQuery = "DELETE FROM projects WHERE projectId = ?";

export const deletePageQuery = "DELETE FROM pages WHERE pageId = ?";

export const deleteCustomComponentQuery = "DELETE FROM components WHERE userId = ? and id = ?";

export const deleteAllCustomComponentsQuery = "DELETE FROM components WHERE userId = ?";

export const updatePageData = "UPDATE pages SET data = ?, lastModified = NOW() WHERE pageId = ?";

export const getPageByPageIdQuery = "SELECT p.pageId, p.projectId, p.pageName, p.description, p.url, p.data, p.lastModified, p.isPublished, pr.userId FROM pages p JOIN projects pr ON p.projectId = pr.projectId WHERE p.pageId = ?";

export const deleteUserQuery = "DELETE FROM users where userId = ?";

export const getPublishedPageQuery = "SELECT * FROM pages where url = ? AND isPublished = 1";

export const publishPageQuery = "UPDATE pages SET isPublished = 1 WHERE pageId = ? AND projectId = ?";

export const unPublishPageQuery = "UPDATE pages SET isPublished = 0 WHERE pageId = ? AND projectId = ?";

export const checkPageUrlQuery = "SELECT * FROM pages WHERE url = ?";

export const deleteAllProjectsQuery = "DELETE FROM projects WHERE userId = ?";

export const renamePageQuery = "UPDATE pages SET pageName = ?, description = ?, url = ? WHERE pageId = ?";

export const getAllTemplatesQuery = "SELECT * FROM templates";

export const getSpecificTemplateQuery = "SELECT * FROM templates WHERE templateId = ?";