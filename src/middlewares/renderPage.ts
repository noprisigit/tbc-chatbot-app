import path from 'path';
import ejs from 'ejs';

export async function renderPage(page: string, data: object = {}) {
  const pageContent = await ejs.renderFile(
    path.join(__dirname, '../views/pages', `${page}.ejs`),
    data
  );
  return pageContent;
}
