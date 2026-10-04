"""
Project Service: Manages registered project workspaces and file structures.
"""

import os
import uuid
from datetime import datetime
from typing import List, Dict, Optional, Any
from backend.models.schemas import Project, ProjectCreate
from backend.tools.repo_tools import list_files, build_file_tree, read_file, detect_project_metadata


class ProjectService:
    def __init__(self):
        self._projects: Dict[str, Project] = {}
        self._initialize_default_projects()

    def _initialize_default_projects(self):
        """Register the built-in sample projects."""
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../sample_projects"))
        
        fib_path = os.path.join(base_dir, "fibonacci")
        if os.path.exists(fib_path):
            self.create_project(ProjectCreate(
                name="Fibonacci Suite",
                path=fib_path,
                language="python",
                framework="pytest"
            ), project_id="proj-fibonacci")

        pal_path = os.path.join(base_dir, "palindrome")
        if os.path.exists(pal_path):
            self.create_project(ProjectCreate(
                name="Palindrome Validator",
                path=pal_path,
                language="python",
                framework="pytest"
            ), project_id="proj-palindrome")

    def create_project(self, project_in: ProjectCreate, project_id: Optional[str] = None) -> Project:
        pid = project_id or f"proj-{uuid.uuid4().hex[:8]}"
        abs_path = os.path.abspath(project_in.path)
        
        meta = detect_project_metadata(abs_path) if os.path.exists(abs_path) else {}
        files = list_files(abs_path) if os.path.exists(abs_path) else []
        
        project = Project(
            id=pid,
            name=project_in.name,
            path=abs_path,
            language=project_in.language or meta.get("language", "python"),
            framework=project_in.framework or meta.get("framework", "vanilla"),
            created_at=datetime.now().isoformat(),
            file_count=len(files)
        )
        self._projects[pid] = project
        return project

    def list_projects(self) -> List[Project]:
        # Update file counts dynamically
        for p in self._projects.values():
            if os.path.exists(p.path):
                p.file_count = len(list_files(p.path))
        return list(self._projects.values())

    def get_project(self, project_id: str) -> Optional[Project]:
        return self._projects.get(project_id)

    def get_file_tree(self, project_id: str) -> List[Dict[str, Any]]:
        project = self.get_project(project_id)
        if not project or not os.path.exists(project.path):
            return []
        return build_file_tree(project.path)

    def get_file_content(self, project_id: str, rel_path: str) -> str:
        project = self.get_project(project_id)
        if not project:
            raise FileNotFoundError("Project not found")
        return read_file(project.path, rel_path)


project_service = ProjectService()
