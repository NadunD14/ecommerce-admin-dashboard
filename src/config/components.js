// src/config/components.js
import { ComponentLoader } from 'adminjs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentLoader = new ComponentLoader();

const Components = {
    Dashboard: componentLoader.add('Dashboard', path.join(__dirname, './dashboard')),
};

export { componentLoader, Components };
