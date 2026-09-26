"""add role to users

Revision ID: 002
Revises: 001
Create Date: 2026-09-26 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # server_default backfills existing rows so the column can be NOT NULL.
    op.add_column(
        'users',
        sa.Column(
            'role',
            sa.String(length=32),
            nullable=False,
            server_default='citizen',
        ),
    )


def downgrade() -> None:
    op.drop_column('users', 'role')
