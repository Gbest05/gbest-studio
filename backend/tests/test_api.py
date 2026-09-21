import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import init_db

@pytest.mark.anyio
async def test_health_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["app"] == "GBEST STUDIO"

@pytest.mark.anyio
async def test_project_lifecycle():
    init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Create project
        create_res = await ac.post("/api/projects", json={
            "name": "Test TikTok Project",
            "aspect_ratio": "9:16"
        })
        assert create_res.status_code == 200
        project = create_res.json()
        project_id = project["id"]
        assert project["name"] == "Test TikTok Project"
        assert project["aspect_ratio"] == "9:16"

        # 2. Get project
        get_res = await ac.get(f"/api/projects/{project_id}")
        assert get_res.status_code == 200
        assert get_res.json()["id"] == project_id

        # 3. Update project (autosave)
        update_res = await ac.put(f"/api/projects/{project_id}", json={
            "name": "Updated TikTok Reel",
            "project_data": '{"clips":[]}'
        })
        assert update_res.status_code == 200
        assert update_res.json()["name"] == "Updated TikTok Reel"

        # 4. List projects
        list_res = await ac.get("/api/projects")
        assert list_res.status_code == 200
        assert len(list_res.json()) >= 1

        # 5. Duplicate project
        dup_res = await ac.post(f"/api/projects/{project_id}/duplicate")
        assert dup_res.status_code == 200
        dup_data = dup_res.json()
        assert dup_data["name"] == "Updated TikTok Reel (Copy)"

        # 6. Delete project
        del_res = await ac.delete(f"/api/projects/{project_id}")
        assert del_res.status_code == 200
